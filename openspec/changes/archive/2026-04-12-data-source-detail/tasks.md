## 1. Backend — Query & DTO

- [x] 1.1 Create `DataSourceDetailDto.cs` record with `Primary` and `Description` fields, and `DataSourceDetailsPagedResult` in `MIMS.Application/DataSources/Queries/GetDataSourceDetails/`
- [x] 1.2 Create `GetDataSourceDetailsQuery.cs` accepting `DataSourceId` (Guid), `Page` (default 1), and `PageSize` (default 10)
- [x] 1.3 Create `GetDataSourceDetailsQueryHandler.cs` that queries `IApplicationDbContext.DataSourceDetails` filtered by `DataSourceId`, applies pagination, and returns `DataSourceDetailsPagedResult`

## 2. Backend — API Controller

- [x] 2.1 Create `DataSourcesController.cs` in `MIMS.Api/Controllers/` with route `GET api/data-sources/{id}/details`, accepting `page` and `pageSize` query params
- [x] 2.2 Inject `IMediator` and dispatch `GetDataSourceDetailsQuery`; return `Ok(result)`
- [x] 2.3 Register `DataSourceDetails` DbSet on `IApplicationDbContext` interface and `AppDbContext` if not already present

## 3. Backend — Build Verification

- [x] 3.1 Run `dotnet build` in the `backend/` directory and confirm zero errors

## 4. Frontend — API Integration

- [x] 4.1 Create a typed API fetch function (e.g., `getDataSourceDetails(id, page, pageSize)`) in `frontend/src/lib/api.ts` or similar, calling `GET /api/data-sources/{id}/details`
- [x] 4.2 Update `frontend/src/app/data-sources/[id]/page.tsx` to accept `searchParams` for `page` and `pageSize`, fetch real data via the API function, and remove mock data import
- [x] 4.3 Compute the auto-incrementing index as `(page - 1) * pageSize + rowIndex + 1` and render it in the `#` column
- [x] 4.4 Wire the pagination controls to update the `page` query param in the URL (use `<Link>` with updated `searchParams`)

## 5. Frontend — Build Verification

- [x] 5.1 Run `npm run build` in the `frontend/` directory and confirm zero errors
