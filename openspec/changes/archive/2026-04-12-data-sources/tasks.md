## 1. Backend — API Endpoint

- [x] 1.1 Add `GetDataSourcesQuery` (or equivalent handler/DTO) with `page` and `pageSize` params, returning `items`, `totalCount`, `page`, `pageSize`
- [x] 1.2 Implement the repository/service method that queries `data_source` ordered by `created_date DESC, id DESC` with offset/limit pagination
- [x] 1.3 Map DB result to response DTO with fields: `id`, `dataSourceName`, `createdDate`, `createdBy`
- [x] 1.4 Register `GET /api/data-sources` controller route, wire up handler, default `pageSize=10`
- [x] 1.5 Verify backend builds successfully (`dotnet build` or equivalent)
- [x] 1.6 Smoke-test the endpoint manually (e.g. `curl /api/data-sources`) and confirm correct JSON shape and ordering

## 2. Frontend — Screen Update

- [x] 2.1 Remove the stat cards section (Total Sources, Active Up Time, Sync Errors, Data Throughput) from the data-sources page component
- [x] 2.2 Remove action columns from the data sources table
- [x] 2.3 Add auto-increment `#` index column (computed as `(page - 1) * pageSize + rowIndex + 1`)
- [x] 2.4 Update table columns to: `#`, `Data Source Name`, `Created Date`, `Created By`
- [x] 2.5 Wire the table to `GET /api/data-sources?page=<n>&pageSize=10` — replace any mock/static data
- [x] 2.6 Add loading state (skeleton or spinner) while the API request is in flight
- [x] 2.7 Add empty state message when `totalCount === 0`
- [x] 2.8 Add pagination control; on page change, refetch with updated `page` param
- [x] 2.9 Verify frontend builds successfully (`npm run build` or equivalent)
- [x] 2.10 Manually verify the screen in the browser: stat cards absent, correct columns, pagination works, index resets per page
