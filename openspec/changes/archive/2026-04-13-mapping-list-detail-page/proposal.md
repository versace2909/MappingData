## Why

The `/mappings-list` page already renders mapping names as links to `/mappings-list/{id}`, but only for `Verifying` or `Verified` statuses — and the destination page does not exist. Users have no way to review the auto-matched detail rows for any mapping, regardless of status.

## What Changes

- Remove the navigable-status gate: every mapping name in the list SHALL be a clickable link to `/mappings-list/{id}`, regardless of status.
- Create the `/mappings-list/[id]` detail page (Next.js dynamic route) that displays paginated `DataMappingDetail` rows with source field, mapped target field, mapping type, and verified status — matching the approved design.
- Add a backend query handler and controller action `GET /api/data-mapping/{id}/details` that returns a paginated list of `DataMappingDetail` records for the given mapping, including resolved source/target field names and descriptions.

## Capabilities

### New Capabilities
- `mapping-detail-view`: Frontend detail page at `/mappings-list/[id]` and its backing API endpoint `GET /api/data-mapping/{id}/details`. Displays paginated DataMappingDetail rows with source field, matched target field, mapping type, and verified status.

### Modified Capabilities
- `data-mapping-list`: The navigable-status gate requirement is being removed. All mapping name cells SHALL be links to the detail page regardless of status.

## Impact

- **Frontend**: New file `frontend/src/app/mappings-list/[id]/page.tsx` + `MappingDetailClient.tsx`. Update `DataMappingListClient.tsx` to remove status gate.
- **Backend**: New `GetDataMappingDetailsQuery` handler in `MIMS.Application`, new `GET /api/data-mapping/{id}/details` action in `DataMappingController`.
- **API contract**: New endpoint added; no breaking changes to existing endpoints.
