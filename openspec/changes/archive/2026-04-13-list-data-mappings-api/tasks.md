## 1. Backend — Query & Endpoint

- [x] 1.1 Verify `GetDataMappingListQuery` record exists with `Page`, `PageSize`, and `MappingName` parameters
- [x] 1.2 Verify `GetDataMappingListQueryHandler` applies `MappingName` filter with `.Contains()`, orders by `CreatedDate` descending, and returns `DataMappingPagedResult`
- [x] 1.3 Verify `DataMappingListItemDto` includes all required fields: `Id`, `MappingName`, `CreatedDate`, `CreatedBy`, `SourceDataName`, `TargetDataName`, `Status`
- [x] 1.4 Verify `DataMappingController.GetList` is registered at `GET /api/data-mapping` with correct `[FromQuery]` params defaulting to `page=1`, `pageSize=10`
- [x] 1.5 Confirm `IApplicationDbContext` exposes `DataMappings` DbSet with `SourceData` and `TargetData` navigation properties available for `.Include()`

## 2. Backend — Build & Smoke Test

- [x] 2.1 Run `dotnet build` in `backend/` and confirm zero errors
- [ ] 2.2 Start the API (`dotnet run --project MIMS.Api`) and call `GET /api/data-mapping` — confirm `200 OK` with `{ items, totalCount, page, pageSize }` shape
- [ ] 2.3 Call `GET /api/data-mapping?mappingName=test` and confirm filter is applied (results are subset or empty)
- [ ] 2.4 Call `GET /api/data-mapping?page=2&pageSize=5` and confirm correct `page` and `pageSize` reflected in response

## 3. Frontend — API Client

- [x] 3.1 Verify `src/lib/api.ts` exports `DataMappingListItem`, `DataMappingPagedResult` types and `getDataMappingList(page, pageSize, mappingName?)` function
- [x] 3.2 Confirm `getDataMappingList` builds URL params correctly and calls `/api/data-mapping`

## 4. Frontend — List Page

- [x] 4.1 Verify `frontend/src/app/mappings-list/page.tsx` exists and wraps `DataMappingListClient` in `AppLayout`
- [x] 4.2 Verify `DataMappingListClient` initialises state for `filter`, `page`, `items`, `totalCount`, `loading`
- [x] 4.3 Confirm debounce of 350 ms is applied to the filter input before triggering a new fetch
- [x] 4.4 Confirm pagination buttons (first, prev, next, last) update page state and re-fetch
- [x] 4.5 Confirm Mapping Name renders as a link (`/mappings-list/{id}`) only when `status` is `Verifying` or `Verified`; all other statuses render as plain text
- [x] 4.6 Confirm `StatusBadge` renders colour-coded badges for `New`, `Processing`, `Mapping`, `Verifying`, `Verified`

## 5. Frontend — Build & Integration

- [x] 5.1 Run `npm run build` in `frontend/` and confirm zero errors
- [ ] 5.2 Start frontend dev server and navigate to `/mappings-list` — confirm the grid loads live data from the running backend
- [ ] 5.3 Confirm sidebar "Mapping List" link navigates to `/mappings-list` and highlights as active
- [ ] 5.4 Type a filter string in the input, wait for debounce, and confirm the grid re-fetches with the filter applied
