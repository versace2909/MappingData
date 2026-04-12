## Context

The backend follows a CQRS pattern using MediatR, with layers: `MIMS.Api` (controllers), `MIMS.Application` (commands/queries/handlers), `MIMS.Core` (entities), and `MIMS.Infrastructure` (persistence via EF Core). The existing `GetDataSourcesQuery` and its handler serve as the reference pattern for new paginated queries.

The frontend is a Next.js app. The `data-sources/[id]/page.tsx` already exists with a UI stub backed by mock data (`dataSourcePreviewFields`). The goal is to replace mock data with real API data.

The `DataSourceDetail` entity has: `Id`, `DataSourceId`, `PrimaryColumnData`, `DescriptionColumnData`.

## Goals / Non-Goals

**Goals:**
- Implement `GET /api/data-sources/{id}/details?page=1&pageSize=10` returning paginated `DataSourceDetail` records
- Replace mock data in the frontend detail page with real API data
- Auto-incrementing index column in the UI (computed client-side from page offset)
- BE and FE build and run successfully

**Non-Goals:**
- Sorting or filtering of detail records
- CRUD operations on `DataSourceDetail`
- Authentication/authorization changes

## Decisions

### 1. Query lives in `DataSources/Queries/GetDataSourceDetails/`
Follow the same folder structure as `GetDataSources` for consistency. Creates: `GetDataSourceDetailsQuery.cs`, `GetDataSourceDetailsQueryHandler.cs`, `DataSourceDetailDto.cs`.

### 2. Paginated response reuses same `PagedResult` shape
Return `DataSourceDetailsPagedResult` mirroring `DataSourcesPagedResult` — `Items`, `TotalCount`, `Page`, `PageSize`. Keeps frontend consumption uniform.

### 3. Controller method added to existing `FileController` or a new `DataSourcesController`
A new `DataSourcesController` is preferred over adding to `FileController` (which handles file uploads) to maintain separation of concerns.

### 4. Frontend fetches data server-side (Next.js Server Component)
The existing `[id]/page.tsx` is already an `async` Server Component. Fetch directly from the API in `page.tsx` using `fetch`, passing `page` and `pageSize` query params. Index is computed as `(page - 1) * pageSize + rowIndex + 1`.

### 5. No new repository abstraction
The handler queries `IApplicationDbContext` directly via EF Core, consistent with all existing handlers.

## Risks / Trade-offs

- **DataSourceId not validated** → If the ID doesn't exist, the query returns an empty page (not 404). Acceptable for now; a 404 can be added later.
- **Index is client-computed** → Index resets correctly per page, which matches typical paginated table UX.

## Migration Plan

1. Add BE query/handler/DTO/controller — no DB migration needed (reads existing table)
2. Update FE page to call real API — replace `dataSourcePreviewFields` mock
3. Verify build passes for both BE (`dotnet build`) and FE (`npm run build`)
