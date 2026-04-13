## Why

The system currently allows users to upload and manage data sources but lacks the ability to map fields between them. A data mapping feature is needed to enable users to define relationships between source and target data sources, track mapping status, and run automated mapping — which is the core workflow for data integration.

## What Changes

- Add `GET /data-source/list-dropdown` API endpoint to retrieve data sources as a dropdown list
- Add `POST /data-mapping` API endpoint to create a new data mapping record
- Add `DataMapping` database table with fields: Id, MappingName, SourceDataId, TargetDataId, CreatedDate, CreatedBy, UpdatedDate, UpdatedBy, Status
- Update the `/mappings` screen: replace plain text Source/Target Data fields with filterable dropdowns, add Mapping Name input, remove "Continue to Field Mapping" button, wire "Run Auto Map" button to the create API
- Add new `/mappings/{id}` screen: paginated grid listing all data mappings with filtering by MappingName

## Capabilities

### New Capabilities
- `data-mapping-create`: Create a new data mapping by selecting source and target data sources (with dropdown + filter), entering a mapping name, and submitting via Run Auto Map button
- `data-mapping-list`: View all data mappings for a given context in a paginated grid, filterable by MappingName

### Modified Capabilities
- `list-data-sources`: Extend with a lightweight dropdown endpoint (`/data-source/list-dropdown`) returning id/name pairs for use in dropdowns

## Impact

- **Backend**: New `DataMapping` entity, repository, service, and two new REST controllers; existing DataSource service extended with a dropdown query
- **Frontend**: `/mappings` page UI updated; new `/mappings/{id}` page added
- **Database**: New `DataMapping` table migration
- **Integration**: FE calls new BE endpoints; both projects must build and run successfully together
