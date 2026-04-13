## 1. Database Migration

- [x] 1.1 Add EF Core migration `AddSearchVectorToDataSourceDetail` that adds a `search_vector` stored generated column (`tsvector`) on `DataSourceDetail` computed from `PrimaryColumnData || ' ' || DescriptionColumnData` using `to_tsvector('english', ...)` — **N/A: ParadeDB native BM25 index `ix_data_source_detail_bm25` already exists on `normalize_column_data`; no new migration needed**
- [x] 1.2 Add a GIN index on the `search_vector` column via `CREATE INDEX CONCURRENTLY` in the migration — **N/A: covered by existing BM25 index**
- [x] 1.3 Apply the migration and verify the column and index exist in the database — **Verified: `ix_data_source_detail_bm25` present in `FixNormalizeColumnDataType` migration**

## 2. Backend — Search Query Handler

- [x] 2.1 Create `SearchDataSourceDetailsQuery` record in `MIMS.Application/DataSources/Queries/SearchDataSourceDetails/` with properties: `DataSourceId` (int), `Query` (string?), `Page` (int), `PageSize` (int)
- [x] 2.2 Create `SearchDataSourceDetailsQueryHandler` that, when `Query` is non-empty, calls `IApplicationDbContext.SearchDataSourceDetailsAsync` (uses ParadeDB `<@>` BM25 operator ordered by relevance); when `Query` is empty, returns all rows ordered by `Id`
- [x] 2.3 Return a `DataSourceDetailsPagedResult` with `items`, `page`, `pageSize`, and `totalCount`
- [x] 2.4 Register the handler in DI — auto-scanned by MediatR, no manual registration needed

## 3. Backend — API Endpoint

- [x] 3.1 Add action `GET /api/data-sources/{id}/details/search` to `DataSourcesController` accepting `[FromQuery] string? query`, `[FromQuery] int page = 1`, `[FromQuery] int pageSize = 20`
- [x] 3.2 Dispatch `SearchDataSourceDetailsQuery` via MediatR and return `Ok(result)`
- [ ] 3.3 Test the endpoint manually (or via Swagger) with and without a `query` param to verify BM25 ranking

## 4. Frontend — API Integration

- [x] 4.1 Add `searchDataSourceDetails(id: number, query?: string, page?: number, pageSize?: number)` function to `src/lib/api.ts` calling `GET /api/data-sources/{id}/details/search`
- [x] 4.2 Add a `useDebounce` hook in `src/hooks/useDebounce.ts` that delays a value by 300 ms

## 5. Frontend — Search Page

- [x] 5.1 Create the page directory `src/app/data-source-search/` with `page.tsx`
- [x] 5.2 Implement a data source dropdown using `getDataSourceDropdown()`; display file names as labels and store the selected `id` in local state
- [x] 5.3 Implement the debounced search input: use `useDebounce` on the raw input value and trigger a data fetch whenever the debounced value or selected data source changes
- [x] 5.4 Implement the results grid with columns `#`, `Primary Field`, `Description`, `Normalized`; compute the `#` column as `(page - 1) * pageSize + rowIndex + 1`
- [x] 5.5 Add pagination controls below the grid (first/prev/next/last) that update the `page` state and re-fetch
- [x] 5.6 Show a disabled search input and empty grid when no data source is selected
- [x] 5.7 Show an empty-state message ("No results found") when the API returns zero rows

## 6. Frontend — Navigation

- [x] 6.1 Add a "Data Search" link to `SideNavBar` pointing to `/data-source-search` with `manage_search` icon

## 7. Verification

- [ ] 7.1 Confirm selecting a data source loads all rows without a query
- [ ] 7.2 Confirm typing a search term (with debounce) filters results in BM25 relevance order
- [ ] 7.3 Confirm clearing the search input restores the full list
- [ ] 7.4 Confirm rapid keystrokes only send one request after the debounce window
- [ ] 7.5 Confirm pagination works correctly for both empty and non-empty queries
