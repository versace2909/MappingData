## Why

The `/mappings` page currently displays static mock data with no real backend. Users need a live, paginated list of data mappings fetched from the database so they can track mapping progress and status.

## What Changes

- Add `GET /api/data-mapping` backend endpoint returning a paginated, filterable list of `DataMapping` records
- Replace mock data in the frontend mappings page with real API calls to the new endpoint
- Return fields: `id`, `mappingName`, `createdDate`, `createdBy`, `sourceDataName`, `targetDataName`, `status`

## Capabilities

### New Capabilities

<!-- No new capabilities — requirements are fully specified in the existing data-mapping-list spec -->

### Modified Capabilities

- `data-mapping-list`: Implementing the already-specified requirements for the paginated list endpoint and frontend integration (no requirement changes — pure implementation of the existing spec)

## Impact

- **Backend**: New query handler + EF Core query in `MIMS.Application` and `MIMS.Infrastructure`; new controller action in `MIMS.Api`
- **Frontend**: `src/lib/api.ts` gains a typed `getDataMappings` function; `/mappings` page replaced mock data with live API calls and pagination state
- **Database**: Read-only queries against existing `DataMappings` table (no migrations needed)
