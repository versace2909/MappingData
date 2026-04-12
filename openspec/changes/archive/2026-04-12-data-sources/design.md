## Context

The data-sources screen at `/data-sources` currently has a scaffold with stat cards (Total Sources, Active Up Time, Sync Errors, Data Throughput) and a table with action columns. The upload sub-screen at `/data-sources/upload` is functional. This change focuses on implementing the main listing page — wiring up a real paginated API and cleaning up the UI to show only the relevant table.

The backend follows a .NET / ASP.NET Core pattern (NestJS or similar based on existing specs). The frontend is a Next.js app. The existing `data_source` table already has `data_source_name`, `created_by`, and `created_date` columns (established by the data-source-upload spec).

## Goals / Non-Goals

**Goals:**
- Implement `GET /api/data-sources` endpoint with pagination (default page size 10, ordered by `created_date` desc)
- Return `dataSourceName`, `createdDate`, `createdBy` per record plus total count for pagination
- Update the FE data-sources listing page: remove stat cards, remove action columns, add auto-increment index column, wire up pagination

**Non-Goals:**
- Search/filter on the listing page (out of scope for this change)
- Edit or delete actions on data sources
- Changes to the upload flow

## Decisions

### 1. Separate listing endpoint from `/recent`
The existing `/api/data-sources/recent` endpoint returns up to 10 records with no pagination and includes `fileSize` and `downloadUrl`. The new `/api/data-sources` endpoint serves the full paginated listing with different fields. Keeping them separate avoids breaking the upload screen's recent table.

**Alternative considered**: Extend `/recent` with pagination params — rejected because the response shape and intent differ.

### 2. Server-side pagination
Pagination is handled server-side with `page` (1-based) and `pageSize` query params. The response includes `totalCount` so the FE can render a page control. Default `pageSize=10`.

**Alternative considered**: Cursor-based pagination — overkill for this dataset size and UI pattern.

### 3. Auto-increment index in FE, not API
The sequential row number (`#`) is computed client-side as `(page - 1) * pageSize + rowIndex + 1`. The API does not return an index field.

### 4. Remove stat cards entirely
The four metric cards (Total Sources, Active Up Time, Sync Errors, Data Throughput) are removed from the component. No deprecation period needed — they were never connected to real data.

## Risks / Trade-offs

- **Ordering stability**: `ORDER BY created_date DESC` may be non-deterministic for records with identical timestamps. Mitigation: secondary sort by `id DESC` to ensure stable ordering.
- **Page size flexibility**: FE currently hardcodes default 10; if requirements change, the API already accepts `pageSize` as a query param so FE can adapt without backend changes.
