## Why

Users need to view the details of a specific data source, including its description and primary fields, to understand what data is available and how it is structured. This feature is needed to complete the data source management workflow.

## What Changes

- Add a new API endpoint `GET /data-sources/:id` that returns paginated detail records from the `dataSourceDetail` table, including `primary` and `description` fields (default 10 items per page)
- Add a new frontend page at `data-sources/{id}` that displays the data source detail in a table with an auto-incrementing index column

## Capabilities

### New Capabilities
- `data-source-detail`: View paginated detail records (primary, description) for a specific data source by its ID, with an auto-incrementing index column in the UI

### Modified Capabilities

## Impact

- **Backend**: New API route and controller/service/repository logic for fetching paginated `dataSourceDetail` records by `dataSourceId`
- **Frontend**: New page/route at `data-sources/[id]` with a detail table component
- **Database**: Reads from existing `dataSourceDetail` table; no schema changes required
