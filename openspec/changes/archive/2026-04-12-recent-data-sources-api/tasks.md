## 1. Backend — Query & Application Layer

- [x] 1.1 Create `GetRecentDataSourcesQuery` record in `MIMS.Application/DataSources/Queries/GetRecentDataSources/` with optional `SourceName` string parameter
- [x] 1.2 Create `RecentDataSourceDto` result record with fields: `DataSourceName`, `UploadDate`, `FileSize`, `DownloadUrl`
- [x] 1.3 Extend `IFileStorageService` with `GetDownloadUrlAsync(string key, TimeSpan expiry)` returning a pre-signed URL string
- [x] 1.4 Implement `GetDownloadUrlAsync` in the S3/LocalStack `FileStorageService` implementation using the AWS SDK pre-signed URL API with 1-hour expiry
- [x] 1.5 Create `GetRecentDataSourcesQueryHandler` that queries `data_source` ordered by `CreatedDate` desc, applies optional case-insensitive `Contains` filter on `DataSourceName`, takes top 10, and calls `GetDownloadUrlAsync` for each result using the key `data-sources/{id}/{fileName}`

## 2. Backend — API Controller

- [x] 2.1 Add `GET /api/data-sources/recent` action to `FileController` that accepts optional `[FromQuery] string? sourceName`, dispatches `GetRecentDataSourcesQuery` via `IMediator`, and returns `Ok(result)`

## 3. Backend — Build & Verify

- [x] 3.1 Run `dotnet build` from the backend root and confirm zero errors
- [ ] 3.2 Test the endpoint manually with `curl` or a REST client: no filter returns ≤10 records; `?sourceName=<value>` filters correctly; empty filter returns 200 with `[]`

## 4. Frontend — API Integration

- [x] 4.1 Create a `fetchRecentDataSources(sourceName?: string)` async function (or inline fetch) in `upload/page.tsx` that calls `GET /api/data-sources/recent?sourceName=<value>` and returns the typed response array
- [x] 4.2 Add component state: `recentSources` (array), `recentLoading` (boolean), `recentError` (string|null), `filterText` (string)
- [x] 4.3 Implement 300ms debounce: in a `useEffect` watching `filterText`, set a `setTimeout` that calls `fetchRecentDataSources(filterText)` and clears on cleanup
- [x] 4.4 Trigger initial fetch on page mount (empty `filterText`) to populate the table when the page loads

## 5. Frontend — Table UI Wiring

- [x] 5.1 Wire the existing `<input>` search field in the table header to `filterText` state (`value` + `onChange`)
- [x] 5.2 Render a loading skeleton or spinner row in `<tbody>` while `recentLoading` is true
- [x] 5.3 Render the empty-state row ("No data sources uploaded yet.") when `recentSources` is empty and not loading
- [x] 5.4 Render one `<tr>` per `recentSources` item with columns: Source Name, formatted Upload Date, human-readable File Size, and an Actions cell containing a download `<a>` tag pointing to `downloadUrl`
- [x] 5.5 Refresh the recent data sources table automatically after a successful upload (call fetch after the upload success handler)

## 6. Frontend — Build & Verify

- [x] 6.1 Run `npm run build` (or `next build`) from the frontend root and confirm zero type errors and build errors
- [ ] 6.2 Start the dev server and navigate to `/data-sources/upload`; verify the table loads, the filter debounce works, and the download button triggers a file download
- [ ] 6.3 Upload a new file and confirm the new record appears in the Recent Data Sources table immediately after upload succeeds
