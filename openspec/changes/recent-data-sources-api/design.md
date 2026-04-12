## Context

The `data-sources/upload` screen already has a static "Recent Data Sources" table shell in the frontend (`upload/page.tsx`) with columns for Source Name, Upload Date, Size, and Actions — but it is not wired to any API. The backend has a `DataSource` entity stored in the `data_source` table with all required fields (`DataSourceName`, `CreatedDate`, `FileSize`, `FileName`). Uploaded files are stored in S3 (LocalStack in dev) under `data-sources/{dataSourceId}/{originalFileName}`.

The project follows CQRS via MediatR: commands/queries live in `MIMS.Application/DataSources/`, the controller dispatches through `IMediator`, and persistence is accessed via `IApplicationDbContext`. File storage is abstracted through `IFileStorageService`.

## Goals / Non-Goals

**Goals:**
- Expose `GET /api/data-sources/recent?sourceName=<optional>` returning up to 10 records sorted by `CreatedDate` descending
- Each record includes: `dataSourceName`, `uploadDate`, `fileSize`, and a `downloadUrl` for the original file
- Frontend wires the existing table shell to this endpoint with a 300ms debounced source-name filter

**Non-Goals:**
- Pagination beyond the fixed 10-record limit
- Sorting options other than `CreatedDate` descending
- Editing or deleting data source records
- Exposing data source detail rows (only the parent `DataSource` record)

## Decisions

### 1. Query handler via MediatR (not direct repo call in controller)
**Decision**: Introduce `GetRecentDataSourcesQuery` + handler in `MIMS.Application/DataSources/Queries/`.
**Why**: Consistent with the existing command pattern (`UploadDataSourceCommand`). Keeps the controller thin and logic testable.
**Alternatives considered**: Direct EF Core call in controller — rejected to avoid bypassing the application layer.

### 2. Pre-signed S3 URL for download
**Decision**: The query handler calls `IFileStorageService.GetDownloadUrlAsync(key)` to generate a time-limited pre-signed URL, returned as `downloadUrl` in the response.
**Why**: Files are private in S3; pre-signed URLs are the standard mechanism. The existing `IFileStorageService` abstraction handles LocalStack/AWS differences transparently.
**Alternatives considered**: Proxy download through a new `/api/data-sources/{id}/download` endpoint — more complex, adds server bandwidth; pre-signed URL is simpler and scalable.

### 3. `sourceName` filter as optional query parameter (contains, case-insensitive)
**Decision**: `EF.Functions.Like` or `ToLower().Contains()` on `DataSourceName` in the LINQ query.
**Why**: Simple server-side filtering without a full-text index; the 10-row cap keeps performance acceptable.

### 4. Frontend debounce with `useEffect` + `setTimeout`
**Decision**: 300ms debounce implemented inline in the upload page component using `useEffect` and `clearTimeout`.
**Why**: No additional dependencies needed; consistent with existing patterns in the codebase (no debounce utility currently exists).

### 5. Download via `<a href={downloadUrl} download>` tag
**Decision**: The Actions column renders a link/button pointing directly to the pre-signed URL.
**Why**: Pre-signed URLs from S3 already trigger a file download; no extra fetch logic required on the frontend.

## Risks / Trade-offs

- **Pre-signed URL expiry**: URLs expire (e.g., 15 min). If a user keeps the table open and clicks Download after expiry, the download fails.
  → Mitigation: Set expiry to 1 hour, which is sufficient for typical usage. Document this in the spec.
- **LocalStack compatibility**: LocalStack pre-signed URL generation may differ from AWS in dev.
  → Mitigation: Use the existing `IFileStorageService` abstraction, which already handles LocalStack in other contexts.
- **S3 key availability**: If a `DataSource` record exists but the file was never stored (e.g., partial failure), `downloadUrl` will be a broken link.
  → Mitigation: The upload flow already returns 503 on S3 failure and does not insert the DB record, so this state should not occur in practice.

## Migration Plan

1. Add query + handler in `MIMS.Application`
2. Extend `IFileStorageService` with `GetDownloadUrlAsync` if not already present
3. Add controller action to `FileController`
4. Wire frontend table to new endpoint with debounced filter input
5. No DB migration required — reads existing `data_source` table
6. Rollback: remove the controller action; frontend falls back to the static empty-state table
