## Context

The `/mappings-list` list page (`DataMappingListClient.tsx`) already links mapping names to `/mappings-list/{id}` but only for `Verifying`/`Verified` statuses. The destination route does not exist. The backend has a `DataMappingDetail` entity (with `SourceDataId`, `TargetDataId`, `MappingType`, `IsVerified`, `Score`) and the `DataMappingDetails` table is already migrated. No query handler exists yet for fetching detail rows by mapping ID. The approved design (`stitch_mims_2.5/refined_mapping_results/code.html`) shows a paginated table with source field, mapped target field, mapping type badge, and verified status.

## Goals / Non-Goals

**Goals:**
- Create `GET /api/data-mapping/{id}/details` paginated endpoint returning `DataMappingDetail` rows with resolved field names and descriptions.
- Create the `/mappings-list/[id]` Next.js page rendering the detail table from the approved design.
- Remove the status gate in `DataMappingListClient.tsx` so all mapping names link to the detail page.

**Non-Goals:**
- Editing verified status or manually re-linking fields from the detail page (deferred).
- The "Change Mapping" modal interaction (UI-only in design; not wired to an API in this change).
- The FAB "Manual Link" button (deferred).

## Decisions

### Decision: New query handler vs extending existing list handler
Add a dedicated `GetDataMappingDetailsQuery` / `GetDataMappingDetailsQueryHandler` in `MIMS.Application`. Reusing the list handler would couple two different aggregate concerns. The handler joins `DataMappingDetails → DataSourceDetail` (source) and optionally `DataSourceDetail` (target) to produce flat DTOs.

### Decision: Response DTO shape
Each item returns: `id`, `sourceCode` (DataSourceDetail.Primary), `sourceDescription` (DataSourceDetail.Description), `targetCode` (nullable), `targetDescription` (nullable), `mappingType` (Auto|Manual string), `isVerified` (bool), `score` (double?). This is a flat read model — no nested objects — so the frontend can render without transformation.

### Decision: Pagination on detail endpoint
Support `page` (default 1) and `pageSize` (default 20) query params. Returns `{ items, totalCount, page, pageSize }` — same envelope as the list endpoint for consistency.

### Decision: Status gate removal
The gate (`NAVIGABLE_STATUSES`) was a placeholder pending this page existing. Removing it simplifies the list component and matches user expectation that a name is always a navigation target.

### Decision: Client component pattern
Follow the existing `DataMappingListClient.tsx` pattern: a `page.tsx` server component that renders a `MappingDetailClient.tsx` client component. The client fetches via `apiFetch` in `useEffect`.

## Risks / Trade-offs

- [Large result sets] Detail rows could be many (one per source row) → Mitigation: paginate with default pageSize=20; add `totalCount` for accurate pagination controls.
- [Missing mapping ID] If the ID doesn't exist, the API returns 404 → Mitigation: frontend shows a "not found" state when API returns non-2xx.
- [Score nullability] `Score` may be null for manual entries → Mitigation: treat null score as omitted in the response DTO, not shown in UI.
