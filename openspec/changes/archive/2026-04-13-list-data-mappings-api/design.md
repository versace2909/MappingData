## Context

The `GET /api/data-mapping` endpoint and the `/mappings-list` frontend page are already present in the codebase. The backend query handler, controller action, frontend API client function, and list page component all exist. This design documents the technical decisions made and serves as a record for the implementation.

**Current state:**
- `DataMappingController.GetList` at `GET /api/data-mapping` — fully implemented
- `GetDataMappingListQueryHandler` performs EF Core query with pagination and optional `MappingName` filter
- `api.ts` exports `getDataMappingList()` with typed return types
- `frontend/src/app/mappings-list/DataMappingListClient.tsx` renders the paginated, filterable grid
- Side navigation links to `/mappings-list` as "Mapping List"

## Goals / Non-Goals

**Goals:**
- Verify the end-to-end flow compiles and runs without errors
- Confirm the backend endpoint returns correct paginated results
- Confirm the frontend page fetches and renders live data from the API

**Non-Goals:**
- Sorting by columns other than `CreatedDate` (not required by spec)
- Authentication/authorization on the endpoint (not in scope)
- Server-side rendering for the list (client-side fetch is sufficient)

## Decisions

**CQRS query handler (not inline controller logic)**
The list query follows the same `MediatR` pattern as all other queries in the project. This keeps the controller thin and the query logic testable in isolation.

**EF Core `.Include()` for joined names**
`SourceDataName` and `TargetDataName` are resolved by including the related `DataSource` navigation properties and projecting directly in the `.Select()`. Alternative: a raw SQL join. EF Core navigation includes are preferred here because the schema is simple and there's no performance concern at this scale.

**Debounced client-side filter input**
The frontend applies a 350 ms debounce before sending the `mappingName` query param. This avoids hammering the API on every keystroke while keeping the UX responsive.

**`/mappings-list` route (separate from `/mappings`)**
`/mappings` is the "Create Mapping" page (form + Run Auto-Map). A separate `/mappings-list` route avoids conflating creation and listing. Navigation in the sidebar reflects this split.

**Navigable status gate**
Only rows with `Status = Verifying` or `Verified` render as clickable links to the detail page. Other statuses render as plain text with a tooltip. This matches the requirement from `data-mapping-create` spec.

## Risks / Trade-offs

- [EF Core N+1 on navigation properties] → Mitigated: `.Include(m => m.SourceData).Include(m => m.TargetData)` is applied before `.Select()`, so a single JOIN query is issued.
- [Case-sensitivity in `MappingName` filter] → EF Core with Npgsql uses `ILIKE` for `.Contains()` on PostgreSQL, so case-insensitive matching is handled by the DB collation.
