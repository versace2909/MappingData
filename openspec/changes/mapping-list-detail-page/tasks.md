## 1. Backend — Query handler and DTO

- [x] 1.1 Create `DataMappingDetailItemDto.cs` in `MIMS.Application/DataMappings/Queries/GetDataMappingDetails/` with properties: `Id`, `SourceCode`, `SourceDescription`, `TargetCode` (nullable), `TargetDescription` (nullable), `MappingType` (string), `IsVerified` (bool), `Score` (double?)
- [x] 1.2 Create `GetDataMappingDetailsQuery.cs` in the same folder — a MediatR `IRequest<PagedResult<DataMappingDetailItemDto>>` with `int MappingId`, `int Page`, `int PageSize`
- [x] 1.3 Create `GetDataMappingDetailsQueryHandler.cs` that queries `DataMappingDetails` filtered by `DataMappingId`, joins to `DataSourceDetail` for source and optionally for target, returns 404-style result if mapping doesn't exist, otherwise returns paginated `DataMappingDetailItemDto` list
- [x] 1.4 Reuse or create a shared `PagedResult<T>` DTO in `MIMS.Application/Common/` (check if one already exists from `GetDataMappingList`; if so, reuse it)

## 2. Backend — Controller action

- [x] 2.1 Add `[HttpGet("{id}/details")]` action to `DataMappingController` that sends `GetDataMappingDetailsQuery` with `id`, `page`, `pageSize` query params (default page=1, pageSize=20) and returns `Ok(result)` or `NotFound()` if the handler signals missing mapping

## 3. Frontend — API client

- [x] 3.1 Add `DataMappingDetailItem` interface to `src/lib/api.ts` with fields: `id`, `sourceCode`, `sourceDescription`, `targetCode` (nullable), `targetDescription` (nullable), `mappingType`, `isVerified`, `score` (nullable)
- [x] 3.2 Add `DataMappingDetailPagedResult` interface to `src/lib/api.ts`
- [x] 3.3 Add `getDataMappingDetails(id: number, page?: number, pageSize?: number)` function in `src/lib/api.ts` calling `GET /api/data-mapping/${id}/details`

## 4. Frontend — Detail page

- [x] 4.1 Create `frontend/src/app/mappings-list/[id]/MappingDetailClient.tsx` — a `"use client"` component that fetches detail rows, renders the table (columns: #, Source Field, Mapped Target Field, Mapping Type, Verified Status), handles loading/empty/not-found states, and includes pagination controls (first/prev/next/last)
- [x] 4.2 Style Source Field cell: bold monospace `sourceCode` on top, smaller muted `sourceDescription` below
- [x] 4.3 Style Mapped Target Field cell: bold monospace `targetCode` (or red "UNRESOLVED" when null), smaller muted `targetDescription` below
- [x] 4.4 Style Mapping Type cell: "Auto" badge (gray) or "Manual" badge (amber) matching the design
- [x] 4.5 Style Verified Status cell: green check icon + "Verified" when `isVerified=true`; muted circle icon + "Unverified" when false
- [x] 4.6 Create `frontend/src/app/mappings-list/[id]/page.tsx` — a server component that renders a breadcrumb nav (Mappings → All Mappings → Detail) and mounts `MappingDetailClient`

## 5. Frontend — Remove status gate

- [x] 5.1 In `DataMappingListClient.tsx`, remove the `NAVIGABLE_STATUSES` constant and the conditional rendering. Make every Mapping Name cell a `<Link href={/mappings-list/${item.id}}>{item.mappingName}</Link>` styled as a blue link.
