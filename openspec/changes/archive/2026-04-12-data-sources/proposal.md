## Why

The data-sources screen needs to be implemented to allow users to view and manage their data sources. The current state lacks a functional listing page with proper pagination and relevant metadata display.

## What Changes

- Add a `GET /data-sources` API endpoint that returns paginated data sources ordered by created date descending (default 10 items per page)
- API response includes: index (auto-increment), data source name, created date, created by
- Remove action columns from the data sources table
- Remove the summary statistics section (Total Sources, Active Up Time, Sync Errors, Data Throughput) from the FE screen

## Capabilities

### New Capabilities

- `list-data-sources`: Paginated listing of data sources with name, created date, and created by fields, ordered by created date descending

### Modified Capabilities

- `recent-data-sources`: The existing recent-data-sources spec may overlap — this change introduces a full paginated list view rather than a recent subset

## Impact

- **Backend**: New API endpoint in the data-sources controller/service
- **Frontend**: `data-sources` screen at `/data-sources` route — removes stat cards, updates table columns
- **No breaking changes** to existing endpoints
