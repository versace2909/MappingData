## Context

The project uses .NET 8 with Clean Architecture (Core, Application, Infrastructure, Api layers), EF Core 8 with Npgsql against a TimescaleDB/PostgreSQL instance, and MediatR for CQRS. The frontend is Next.js. Currently the API uses minimal API endpoints only — no controllers yet. The `AppDbContext` is registered as a scoped service; the requirement specifies switching to `IDbContextFactory` for the upload flow. Docker Compose currently only runs TimescaleDB; LocalStack must be added for S3 simulation.

## Goals / Non-Goals

**Goals:**
- Single `POST /api/data-sources/upload` endpoint (multipart/form-data) that validates, stores, and imports a file.
- Template file downloadable from the frontend (`GET /api/data-sources/template`).
- EF Core migration creating `data_source` and `data_source_detail` tables.
- `AppDbContext` re-registered via `IDbContextFactory<AppDbContext>` (used in the import service).
- LocalStack S3 service added to `docker-compose.yml`; raw file stored in an S3 bucket after validation.
- Frontend upload screen: drag-and-drop / click-to-select (xlsx, xls, csv only), one file at a time, required data source name input, template download link.
- Normalization of `description_column_data` into `normalize_column_data` (lowercase, trim, remove non-alphanumeric except spaces).

**Non-Goals:**
- Authentication / authorization (not in scope for this change).
- Asynchronous/background processing (import is synchronous within the request).
- Listing, deleting, or editing existing data sources.
- Support for JSON or other file formats beyond xlsx/xls/csv.

## Decisions

### 1. Controller vs Minimal API
**Decision**: Use a traditional `ApiController` class (`FileController`) as specified.  
**Rationale**: The requirement names `FileController` explicitly. Controllers also make multipart file binding simpler (`IFormFile`) and are easier to extend with filters and model validation.

### 2. File Parsing Libraries
**Decision**: `ClosedXML` for xlsx/xls, `CsvHelper` for csv.  
**Rationale**: ClosedXML is MIT-licensed, no need for a license key (unlike EPPlus ≥5), and has a clean API. CsvHelper is the de-facto standard for CSV in .NET.  
**Alternative considered**: EPPlus — rejected due to license requirements for commercial use.

### 3. DbContext Factory
**Decision**: Register `AppDbContext` with `AddDbContextFactory<AppDbContext>` in addition to (or replacing) the existing scoped `AddDbContext` registration. The import service injects `IDbContextFactory<AppDbContext>` and creates a context per operation.  
**Rationale**: Requirement specifies factory pattern. Also avoids concurrency issues if async streams are used during bulk insert.

### 4. S3 Storage Strategy
**Decision**: Upload the raw file to S3 (LocalStack in dev) *before* inserting rows. The S3 key is `data-sources/{dataSourceId}/{originalFileName}`. Store the key (not a presigned URL) in `data_source.file_name`.  
**Rationale**: Storing the key keeps the database record stable regardless of URL expiry. The `file_name` column stores the original filename; an `s3_key` can be derived or added separately.  
**LocalStack setup**: A new `localstack` service in `docker-compose.yml` exposes port 4566. An init script creates the `mims-data-sources` bucket on startup.

### 5. Validation Order in the Endpoint
1. Form validation: `data_source_name` is non-empty.
2. FE/BE file extension check: only `.xlsx`, `.xls`, `.csv` accepted (checked via `ContentType` and file name extension).
3. Template compliance: file must have exactly two columns named `primary` and `description` (case-insensitive) in the first row.
4. Data presence: at least one data row after the header.
5. Duplicate check: no duplicate values in the `primary` column (case-insensitive).
6. If all pass → upload to S3 → insert to DB.

### 6. Normalization
**Decision**: `normalize_column_data` = `description_column_data.ToLowerInvariant()` with leading/trailing whitespace trimmed and consecutive whitespace collapsed to a single space.  
**Rationale**: Simple, deterministic, reversible enough for fuzzy matching use-cases downstream. Can be extended later.

### 7. Template File
**Decision**: The template is a static `.xlsx` file embedded as an assembly resource in `MIMS.Api`. The `GET /api/data-sources/template` endpoint streams it back with the appropriate `Content-Disposition` header.  
**Alternative considered**: Generating it on-the-fly with ClosedXML — unnecessary complexity for a two-column static template.

### 8. Project Layer Placement
- **Entities**: `DataSource`, `DataSourceDetail` in `MIMS.Core/Entities/`.
- **Command + Handler**: `UploadDataSourceCommand` in `MIMS.Application/DataSources/Commands/`.
- **Service/infrastructure**: S3 upload service interface in `MIMS.Application/Common/Interfaces/`, implementation in `MIMS.Infrastructure/`.
- **Controller**: `FileController` in `MIMS.Api/Controllers/`.
- **EF Configuration**: Fluent API config classes in `MIMS.Infrastructure/Persistence/Configurations/`.

## Risks / Trade-offs

- **Large files / timeout**: Synchronous import of very large files could exceed request timeout. → Mitigation: enforce a 50 MB file size limit at the controller level (`[RequestSizeLimit]`). Document that async processing is a future enhancement.
- **LocalStack availability**: If LocalStack is down, uploads will fail. → Mitigation: health-check in docker-compose; log the S3 error clearly and return a 503. S3 upload failure rolls back before DB insert (S3 first, then DB in a transaction).
- **DbContextFactory vs existing scoped registration**: Changing registration may affect other code paths. → Mitigation: keep `AddDbContextFactory` and also register `IApplicationDbContext` by resolving from the factory (or keep the scoped registration alongside — EF Core supports both simultaneously).
- **ClosedXML .xls support**: ClosedXML supports `.xlsx` only; `.xls` (BIFF8) requires a different library. → Mitigation: treat `.xls` as an alias for `.xlsx` in accept lists but return a clear validation error if the file is actually old-format BIFF8; document this limitation. Alternatively add `NPOI` for `.xls` — defer to implementation.

## Migration Plan

1. Add NuGet packages (`ClosedXML`, `CsvHelper`, `AWSSDK.S3`) to the appropriate projects.
2. Create EF Core migration: `Add-Migration AddDataSourceTables`.
3. Update `docker-compose.yml` to add `localstack` service and init script.
4. Register new services in `DependencyInjection.cs` (factory, S3 client, upload service).
5. Add `FileController` and template resource to `MIMS.Api`.
6. Update frontend upload page to wire up real API calls.

**Rollback**: Drop the migration (`Update-Database <previous>`), remove the LocalStack service, revert code changes.

## Open Questions

- Should `.xls` (legacy binary format) be fully supported or return a helpful error message? Recommend returning a clear error for now and adding NPOI in a follow-up. -> Can remove xls
- What is the maximum allowed file size? Assumed 50 MB based on UI copy — confirm. -> 10mb
- Should the `created_by` / `updated_by` fields be populated from an auth token, or hardcoded to a system user for now (given auth is not in scope)? -> hard-coded as Admin
