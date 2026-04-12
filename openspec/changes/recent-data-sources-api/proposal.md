## Why

Users who upload data sources need to quickly review recent uploads from the `data-sources/upload` screen without navigating elsewhere. A dedicated Recent Data Sources API surfaces the last 10 uploaded files with key metadata and a direct download action, reducing friction in the upload workflow.

## What Changes

- Add a new GET API endpoint that returns the most recent data sources (up to 10), sorted by upload date descending
- The endpoint accepts an optional `sourceName` query parameter for case-insensitive contains filtering
- Response includes: source name, upload date, file size, and a pre-signed/direct download URL for the original uploaded file
- Frontend `data-sources/upload` screen gains a "Recent Data Sources" section below the upload form
- Frontend applies 300ms debounce on the source name filter input before firing the API call

## Capabilities

### New Capabilities
- `recent-data-sources`: Retrieve and display the most recent data source uploads with filtering and file download support

### Modified Capabilities
<!-- No existing spec-level requirements are changing -->

## Impact

- **Backend**: New controller action + service method querying the `data_source` table; S3 pre-signed URL generation for download links
- **Frontend**: New table/list component on `data-sources/upload` screen consuming the new endpoint; debounced search input
- **Database**: Read-only queries against existing `data_source` table — no schema changes required
- **Infrastructure**: Relies on existing LocalStack S3 setup (dev) and AWS S3 (prod) for generating download URLs
