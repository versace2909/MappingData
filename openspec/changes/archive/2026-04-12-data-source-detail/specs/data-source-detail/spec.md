## ADDED Requirements

### Requirement: Fetch paginated data source details by ID
The system SHALL provide an API endpoint `GET /api/data-sources/{id}/details` that returns paginated records from the `DataSourceDetail` table for the given `dataSourceId`. Each record SHALL include `primary` (mapped from `PrimaryColumnData`) and `description` (mapped from `DescriptionColumnData`). The default page size SHALL be 10 items per page.

#### Scenario: Fetch first page with default page size
- **WHEN** a client requests `GET /api/data-sources/{id}/details` with no query params
- **THEN** the system returns a paginated response with up to 10 items, `page: 1`, `pageSize: 10`, and the correct `totalCount`

#### Scenario: Fetch a specific page
- **WHEN** a client requests `GET /api/data-sources/{id}/details?page=2&pageSize=10`
- **THEN** the system returns items 11–20 for the given data source, with `page: 2`

#### Scenario: Data source has no detail records
- **WHEN** a client requests details for a valid `dataSourceId` that has no `DataSourceDetail` records
- **THEN** the system returns an empty `items` array with `totalCount: 0`

### Requirement: Display data source details in a table with auto-incrementing index
The frontend SHALL display data source detail records in a table with three columns: `#` (auto-incrementing index), `Primary Field`, and `Description`. The index column SHALL be computed as `(page - 1) * pageSize + rowIndex + 1` so that it is globally unique across pages.

#### Scenario: View first page of details
- **WHEN** a user navigates to `data-sources/{id}`
- **THEN** the table shows rows with index starting at 1, displaying `PrimaryColumnData` and `DescriptionColumnData` from the API response

#### Scenario: View second page of details
- **WHEN** a user navigates to page 2
- **THEN** the table shows rows with index starting at 11 (for pageSize 10), maintaining continuity with the previous page
