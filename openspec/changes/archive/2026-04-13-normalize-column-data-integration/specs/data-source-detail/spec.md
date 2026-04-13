## MODIFIED Requirements

### Requirement: Fetch paginated data source details by ID
The system SHALL provide an API endpoint `GET /api/data-sources/{id}/details` that returns paginated records from the `DataSourceDetail` table for the given `dataSourceId`. Each record SHALL include `primary` (mapped from `PrimaryColumnData`), `description` (mapped from `DescriptionColumnData`), and `normalized` (mapped from `NormalizeColumnData`). The default page size SHALL be 10 items per page.

#### Scenario: Fetch first page with default page size
- **WHEN** a client requests `GET /api/data-sources/{id}/details` with no query params
- **THEN** the system returns a paginated response with up to 10 items, `page: 1`, `pageSize: 10`, the correct `totalCount`, and each item includes `primary`, `description`, and `normalized` fields

#### Scenario: Fetch a specific page
- **WHEN** a client requests `GET /api/data-sources/{id}/details?page=2&pageSize=10`
- **THEN** the system returns items 11–20 for the given data source, with `page: 2`, each item having `primary`, `description`, and `normalized`

#### Scenario: Data source has no detail records
- **WHEN** a client requests details for a valid `dataSourceId` that has no `DataSourceDetail` records
- **THEN** the system returns an empty `items` array with `totalCount: 0`

### Requirement: Display data source details in a table with auto-incrementing index
The frontend SHALL display data source detail records in a table with four columns: `#` (auto-incrementing index), `Primary Field`, `Description`, and `Normalized`. The index column SHALL be computed as `(page - 1) * pageSize + rowIndex + 1` so that it is globally unique across pages.

#### Scenario: View first page of details — all four columns visible
- **WHEN** a user navigates to `data-sources/{id}`
- **THEN** the table shows rows with index starting at 1, displaying `PrimaryColumnData`, `DescriptionColumnData`, and `NormalizeColumnData` in their respective columns

#### Scenario: View second page of details
- **WHEN** a user navigates to page 2
- **THEN** the table shows rows with index starting at 11 (for pageSize 10), with all four columns populated
