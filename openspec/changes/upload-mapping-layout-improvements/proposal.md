## Why

The Upload page stacks the upload form and the recent data sources table vertically, wasting horizontal screen space and forcing users to scroll past the form to see uploads. The Mapping List grid uses inconsistent row padding and table styling compared to the Data Sources list, breaking visual consistency across the app.

## What Changes

- **Upload page layout**: Restructure the page into a two-column side-by-side layout — upload form (name input, drag-and-drop zone, action buttons, feedback messages) on the left; Recent Data Sources table on the right.
- **Mapping List grid alignment**: Update the Mapping List table's header row padding (`py-3` → `py-4`) and table container styling (shadow, border) to match the Data Sources list grid for visual consistency.

## Capabilities

### New Capabilities
<!-- none — these are layout/styling changes to existing screens -->

### Modified Capabilities
- `data-source-upload`: Layout changes to the upload page (left-right split).
- `data-mapping-list`: Table styling updated to match the data-source list grid.

## Impact

- `frontend/src/app/data-sources/upload/page.tsx` — restructure layout wrapper from vertical stack to two-column flex/grid.
- `frontend/src/app/mappings-list/DataMappingListClient.tsx` — update table header padding and container shadow/border styling.
- No API, backend, or data model changes required.
