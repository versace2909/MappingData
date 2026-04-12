## ADDED Requirements

### Requirement: List data sources API endpoint
The system SHALL expose a `GET /api/data-sources` endpoint that returns a paginated list of data sources ordered by `created_date` descending.

#### Scenario: Default pagination
- **WHEN** a GET request is made to `/api/data-sources` with no query parameters
- **THEN** the endpoint SHALL return HTTP 200 with the first 10 records ordered by `created_date` DESC, `id` DESC, along with `totalCount` and `page` metadata

#### Scenario: Custom page and page size
- **WHEN** a GET request is made to `/api/data-sources?page=2&pageSize=5`
- **THEN** the endpoint SHALL return HTTP 200 with records 6–10 (by created date descending) and the correct `totalCount`

#### Scenario: Empty result
- **WHEN** no data sources exist
- **THEN** the endpoint SHALL return HTTP 200 with an empty `items` array and `totalCount` of 0

---

### Requirement: List data sources response model
Each record in the list data sources response SHALL include the data source name, created date, and created by fields.

#### Scenario: Response fields are present and correctly typed
- **WHEN** the endpoint returns a non-empty result
- **THEN** each item in the `items` array SHALL contain:
  - `id` (string or number): unique identifier of the data source
  - `dataSourceName` (string): the name of the data source
  - `createdDate` (ISO 8601 datetime string): when the data source was created
  - `createdBy` (string): the user who created the data source
- **THEN** the response root SHALL contain:
  - `items` (array): the page of records
  - `totalCount` (number): total number of data sources across all pages
  - `page` (number): the current page number (1-based)
  - `pageSize` (number): the number of items per page

---

### Requirement: Frontend data sources listing screen
The `/data-sources` screen SHALL display a paginated table of all data sources with an auto-increment index column, data source name, created date, and created by columns. The stat cards section (Total Sources, Active Up Time, Sync Errors, Data Throughput) SHALL be removed.

#### Scenario: Table loads on page mount
- **WHEN** the user navigates to `/data-sources`
- **THEN** the screen SHALL fetch `/api/data-sources?page=1&pageSize=10` and display the results in a table

#### Scenario: Index column is auto-incremented
- **WHEN** the table renders records
- **THEN** the first column SHALL display a sequential number starting at 1 for the first record on the current page, incrementing by 1 per row, calculated as `(page - 1) * pageSize + rowIndex + 1`

#### Scenario: Table columns
- **WHEN** the table is rendered
- **THEN** the table SHALL display exactly these columns in order: `#` (index), `Data Source Name`, `Created Date`, `Created By`
- **THEN** the table SHALL NOT display any action columns

#### Scenario: Stat cards are absent
- **WHEN** the user navigates to `/data-sources`
- **THEN** the page SHALL NOT display any of the following sections: Total Sources, Active Up Time, Sync Errors, Data Throughput

#### Scenario: Table shows loading state
- **WHEN** the API request is in flight
- **THEN** the table SHALL display a loading indicator or skeleton state

#### Scenario: Table shows empty state
- **WHEN** the API returns `totalCount` of 0
- **THEN** the table SHALL display a message indicating no data sources are available

#### Scenario: Pagination control
- **WHEN** `totalCount` is greater than `pageSize`
- **THEN** the screen SHALL display a pagination control that allows the user to navigate to other pages
- **WHEN** the user clicks a page number
- **THEN** the table SHALL fetch and display the corresponding page of results
