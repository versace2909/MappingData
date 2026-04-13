## Why

Users need a way to interactively browse and search data source detail rows without navigating away or reloading the page. Currently there is no dedicated search interface — users can only view raw lists. Adding a BM25 full-text search screen lets analysts quickly filter large datasets in real time.

## What Changes

- New frontend page/route with a data source selector dropdown, a debounced text search input, and a results grid.
- New backend API endpoint that accepts a `dataSourceId` and an optional `query` string and returns paginated `DataSourceDetail` rows ranked by BM25 relevance (falling back to full list when query is empty).
- BM25 index leveraged via PostgreSQL `pg_trgm` / `tsvector` full-text search on `primary` and `description` columns of `DataSourceDetail`.

## Capabilities

### New Capabilities

- `data-source-bm25-search`: A search screen that lets users pick a data source from a dropdown, view all its detail rows in a grid, and filter them in real time using a debounced text input that triggers a BM25-ranked query on the backend.

### Modified Capabilities

- `data-source-detail`: Add a new query endpoint that supports BM25 full-text search filtering on `DataSourceDetail` rows by `dataSourceId`.

## Impact

- **Frontend**: New Next.js page under `src/app/data-source-search/` with components for dropdown, debounced search input, and results grid.
- **Backend**: New MediatR query (`SearchDataSourceDetailsQuery`) in `MIMS.Application/DataSources/` plus a corresponding controller action in `MIMS.Api`.
- **Database**: Ensure `DataSourceDetail` table has a GIN/tsvector index on `primary` + `description` for efficient BM25-style search (via `to_tsvector` / `ts_rank`).
- **No breaking changes** to existing endpoints.
