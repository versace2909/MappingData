## 1. Infrastructure & Docker Setup

- [x] 1.1 Add `localstack` service to `docker-compose.yml` (image `localstack/localstack`, port 4566, `SERVICES=s3`)
- [x] 1.2 Create `docker/localstack/init-s3.sh` init script that creates the `mims-data-sources` bucket on startup
- [x] 1.3 Mount the init script as a volume in the LocalStack service in `docker-compose.yml`

## 2. NuGet Packages

- [x] 2.1 Add `ClosedXML` to `MIMS.Infrastructure.csproj`
- [x] 2.2 Add `CsvHelper` to `MIMS.Infrastructure.csproj`
- [x] 2.3 Add `AWSSDK.S3` to `MIMS.Infrastructure.csproj`
- [x] 2.4 Add `Microsoft.EntityFrameworkCore.Tools` to `MIMS.Infrastructure.csproj` (if not present, for migrations)
- [x] 2.5 Add `ClosedXML` to `MIMS.Api.csproj` (for template generation/embedding)

## 3. Domain Entities

- [x] 3.1 Create `MIMS.Core/Entities/DataSource.cs` with properties: `Id` (Guid), `DataSourceName`, `CreatedBy`, `FileName`, `FileSize` (long), `FileExtension`, `CreatedDate`, `UpdatedBy`, `UpdatedDate`
- [x] 3.2 Create `MIMS.Core/Entities/DataSourceDetail.cs` with properties: `Id` (Guid), `DataSourceId` (Guid FK), `PrimaryColumnData`, `DescriptionColumnData`, `NormalizeColumnData`, `CreatedBy`, `UpdatedBy`, `CreatedDate`, `UpdatedDate`, navigation property `DataSource`

## 4. EF Core Configuration & Migration

- [x] 4.1 Create `MIMS.Infrastructure/Persistence/Configurations/DataSourceConfiguration.cs` with Fluent API config (table name, PK, required fields, max lengths)
- [x] 4.2 Create `MIMS.Infrastructure/Persistence/Configurations/DataSourceDetailConfiguration.cs` with Fluent API config (table name, PK, FK to `data_source`, required fields)
- [x] 4.3 Add `DbSet<DataSource> DataSources` and `DbSet<DataSourceDetail> DataSourceDetails` to `AppDbContext`
- [x] 4.4 Update `IApplicationDbContext` interface to include the two new `DbSet` properties
- [x] 4.5 Change `AddDbContext<AppDbContext>` registration in `MIMS.Infrastructure/DependencyInjection.cs` to `AddDbContextFactory<AppDbContext>` and update `IApplicationDbContext` scoped registration to resolve from factory
- [x] 4.6 Run `dotnet ef migrations add AddDataSourceTables --project MIMS.Infrastructure --startup-project MIMS.Api` to generate the migration
- [x] 4.7 Verify the generated migration SQL creates `data_source` and `data_source_detail` tables with all columns

## 5. S3 Service

- [x] 5.1 Create `MIMS.Application/Common/Interfaces/IFileStorageService.cs` interface with method `Task<string> UploadAsync(Stream fileStream, string key, string contentType, CancellationToken ct)`
- [x] 5.2 Create `MIMS.Infrastructure/Storage/S3FileStorageService.cs` implementing `IFileStorageService` using `IAmazonS3`
- [x] 5.3 Add S3 configuration section to `appsettings.json` and `appsettings.Development.json` (ServiceURL for LocalStack, bucket name, region)
- [x] 5.4 Register `IAmazonS3` (with LocalStack endpoint override in dev) and `IFileStorageService` in `MIMS.Infrastructure/DependencyInjection.cs`

## 6. File Parsing & Validation Service

- [x] 6.1 Create `MIMS.Application/Common/Models/DataSourceRow.cs` record with `Primary` and `Description` string properties
- [x] 6.2 Create `MIMS.Application/Common/Interfaces/IFileParserService.cs` interface with method `IReadOnlyList<DataSourceRow> Parse(Stream fileStream, string extension)`
- [x] 6.3 Create `MIMS.Infrastructure/Parsing/FileParserService.cs` implementing `IFileParserService`: parse `.xlsx`/`.xls` with ClosedXML, parse `.csv` with CsvHelper; validate header row has `primary` and `description` columns (case-insensitive, exactly two columns)
- [x] 6.4 Register `IFileParserService` in `MIMS.Infrastructure/DependencyInjection.cs`

## 7. Application Layer — Upload Command

- [x] 7.1 Create `MIMS.Application/DataSources/Commands/UploadDataSource/UploadDataSourceCommand.cs` (MediatR `IRequest<UploadDataSourceResult>`) with properties: `DataSourceName` (string), `FileStream` (Stream), `FileName` (string), `FileSize` (long), `FileExtension` (string), `ContentType` (string)
- [x] 7.2 Create `MIMS.Application/DataSources/Commands/UploadDataSource/UploadDataSourceResult.cs` with `Guid DataSourceId` and `string DataSourceName`
- [x] 7.3 Create `MIMS.Application/DataSources/Commands/UploadDataSource/UploadDataSourceCommandHandler.cs` implementing `IRequestHandler<UploadDataSourceCommand, UploadDataSourceResult>`:
  - Parse file rows via `IFileParserService`
  - Validate: rows non-empty, no duplicate `Primary` values (case-insensitive)
  - Upload file to S3 via `IFileStorageService`
  - Create `DataSource` entity and `DataSourceDetail` entities (with normalization applied to `NormalizeColumnData`)
  - Insert via `IDbContextFactory<AppDbContext>`, save in a transaction
  - Return `UploadDataSourceResult`

## 8. Normalization Helper

- [x] 8.1 Create `MIMS.Application/Common/Helpers/TextNormalizer.cs` static class with `Normalize(string input)` method: lowercase, trim, collapse consecutive whitespace to single space

## 9. API Controller & Template Endpoint

- [x] 9.1 Add `controllers` endpoint mapping in `MIMS.Api/Program.cs` (`app.MapControllers()`) and `builder.Services.AddControllers()`
- [x] 9.2 Create `MIMS.Api/Controllers/FileController.cs` with `[ApiController]` and `[Route("api/data-sources")]`
- [x] 9.3 Implement `POST /upload` action in `FileController`: accept `[FromForm] string dataSourceName` and `IFormFile file`; validate extension (`.xlsx`, `.xls`, `.csv`); dispatch `UploadDataSourceCommand`; return `200 OK` with result or appropriate error codes
- [x] 9.4 Add `[RequestSizeLimit(52428800)]` (50 MB) to the upload action
- [x] 9.5 Add `MIMS.Api/Resources/template.xlsx` embedded resource file (two-column header: `primary`, `description`) created with ClosedXML or as a static file
- [x] 9.6 Implement `GET /template` action in `FileController` that returns the embedded template file as a file download with `Content-Disposition: attachment; filename="data-source-template.xlsx"`

## 10. Frontend — Upload Screen

- [x] 10.1 Add a `data source name` text input field (required) above the file drop zone in `frontend/src/app/data-sources/upload/page.tsx`
- [x] 10.2 Wire up the hidden `<input type="file">` to the drop zone (click handler + `onChange`), restricting `accept` to `.xlsx,.xls,.csv`
- [x] 10.3 Implement `onDrop` handler on the drop zone div: validate extension client-side, set selected file state, display file name
- [x] 10.4 Display validation error message when a disallowed file type is dropped or selected
- [x] 10.5 Add a "Download Template" button/link that calls `GET /api/data-sources/template` and triggers browser download
- [x] 10.6 Add a submit button that is disabled until both `dataSourceName` is non-empty and a file is selected
- [x] 10.7 On submit, send `multipart/form-data` `POST` to `/api/data-sources/upload` with `dataSourceName` and `file` fields
- [x] 10.8 Display success message (data source name) or error message (from API response) after submission
- [x] 10.9 Replace mock data in the recent uploads table with real API data (or leave as placeholder — out of scope per design, but remove mock import)

## 11. Configuration & Environment

- [x] 11.1 Add `S3` config section to `appsettings.Development.json`: `ServiceURL: http://localhost:4566`, `BucketName: mims-data-sources`, `ForcePathStyle: true`
- [x] 11.2 Add `S3` config section to `appsettings.json` with placeholder/production values
- [x] 11.3 Verify `Cors:AllowedOrigins` in `appsettings.Development.json` includes the frontend origin

## 12. Verification

- [x] 12.1 Run `docker-compose up` and confirm LocalStack starts and `mims-data-sources` bucket is created
- [x] 12.2 Run `dotnet ef database update` and confirm both tables are created in the database
- [x] 12.3 Test upload endpoint via Swagger with a valid `.xlsx` file matching the template
- [x] 12.4 Test upload endpoint with an invalid file (wrong extension, missing columns, duplicates) and confirm 400 responses
- [x] 12.5 Confirm uploaded file appears in LocalStack S3 bucket (`aws --endpoint-url=http://localhost:4566 s3 ls s3://mims-data-sources/`)
- [ ] 12.6 Test frontend: drag-and-drop, click-to-browse, template download, successful submit, error display

<!-- Verification tasks (12.x) require a running environment — please run these manually. -->
