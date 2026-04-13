## Context

MIMS 2.5 stores parsed file rows as `DataSourceDetail` records (columns: `PrimaryColumnData`, `DescriptionColumnData`, `NormalizeColumnData`). The existing detail view (`/data-sources/[id]`) paginates these rows but offers no search. Analysts working with large datasets (thousands of rows) need real-time filtering to locate specific entries quickly.

PostgreSQL (TimescaleDB) supports full-text search via `tsvector` / `ts_rank`, which approximates BM25 ranking. The existing `PharmaceuticalTextNormalizer` already normalises text, so normalized data is available for high-quality matching.

## Goals / Non-Goals

**Goals:**
- New dedicated page (`/data-source-search`) with a data source dropdown, debounced text search input, and a results grid.
- Backend search endpoint that returns `DataSourceDetail` rows ranked by full-text relevance when a query is provided, or all rows when query is empty.
- Leverage PostgreSQL `tsvector` + `ts_rank` (BM25 approximation) via an EF Core raw-SQL or `FromSqlRaw` query.
- Frontend debounce (300 ms) to avoid hitting the API on every keystroke.
- Pagination on the results grid (consistent with the existing detail view).

**Non-Goals:**
- Modifying the existing `/data-sources/[id]` page.
- Elasticsearch or any external search engine.
- Fuzzy / typo-tolerant matching (trigram `pg_trgm` similarity) — pure BM25 `tsvector` is sufficient for v1.
- Saving or sharing search queries.

## Decisions

### 1. Search via PostgreSQL `tsvector` + `ts_rank` (not `pg_trgm`)

**Decision**: Use `to_tsvector('english', ...)` + `plainto_tsquery` + `ts_rank` for ranking.

**Rationale**: BM25-style ranking is natively provided by `ts_rank`. `pg_trgm` provides similarity but not relevance ranking. TimescaleDB inherits all PostgreSQL extensions, so no additional setup is needed beyond creating a GIN index.

**Alternative considered**: `pg_trgm` trigram similarity — rejected because it ranks by character overlap, not term frequency/document frequency.

### 2. GIN index on combined `tsvector` column

**Decision**: Add a persisted `tsvector` generated column (`search_vector`) on `DataSourceDetail` with a GIN index, populated from `PrimaryColumnData || ' ' || DescriptionColumnData`.

**Rationale**: A generated column avoids recomputing `to_tsvector` at query time for every row, and the GIN index makes full-text lookups O(log n) instead of sequential scans.

**Alternative considered**: Compute `to_tsvector` inline at query time — rejected for performance on large tables.

### 3. New MediatR query `SearchDataSourceDetailsQuery`

**Decision**: Introduce a dedicated query handler rather than extending `GetDataSourceDetailsQuery`.

**Rationale**: The search path requires `ts_rank` ordering and a `tsquery` parameter. Merging this into the existing paginated query adds conditional complexity. A separate query keeps each handler focused.

### 4. Frontend debounce at 300 ms using `useEffect` + `setTimeout`

**Decision**: Implement debounce in a custom `useDebounce` hook (or inline `useEffect`) with a 300 ms delay.

**Rationale**: 300 ms is the standard UX threshold that feels responsive without hammering the API. No additional library is needed.

### 5. Dropdown loads data sources via existing `GET /api/data-sources` endpoint

**Decision**: Reuse the existing list-data-sources API for populating the dropdown.

**Rationale**: The endpoint already exists and returns `id` + `fileName` fields sufficient for a dropdown. No new API work needed for the dropdown.

## Risks / Trade-offs

- **Risk**: `tsvector` GIN index migration may be slow on a table with millions of rows.
  → **Mitigation**: Run `CREATE INDEX CONCURRENTLY` via an EF migration; document rollback as `DROP INDEX`.

- **Risk**: `plainto_tsquery` does not support phrase or partial-word queries (e.g., typing mid-word returns no results until a full token is typed).
  → **Mitigation**: Acceptable for v1. `websearch_to_tsquery` (PostgreSQL 11+) can be swapped in later for partial support.

- **Risk**: Empty query string with `ts_rank` ordering is undefined.
  → **Mitigation**: When `query` is null/empty, the backend returns all rows ordered by `Id` (standard pagination), bypassing `ts_rank`.

## Migration Plan

1. Add EF Core migration: `AddSearchVectorToDataSourceDetail`
   - Adds `search_vector` generated column (`tsvector GENERATED ALWAYS AS (to_tsvector('english', coalesce("PrimaryColumnData",'') || ' ' || coalesce("DescriptionColumnData",''))) STORED`).
   - Adds `CREATE INDEX CONCURRENTLY gin_datasourcedetail_search ON "DataSourceDetails" USING GIN ("search_vector")`.
2. Deploy backend with new endpoint.
3. Deploy frontend with new page.
4. Rollback: Drop the index and generated column; remove the new endpoint and page.

## Open Questions

- Should the search page be accessible from the sidebar navigation? (Assumed yes — add a nav entry.)
- What page size should the search results default to? (Assumed 20, same as detail view default for search UX.)
