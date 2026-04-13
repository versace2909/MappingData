## ADDED Requirements

### Requirement: Backend exposes paginated data mapping list endpoint
`GET /api/data-mapping` SHALL return a paginated list of data mappings. Supported query params: `page` (default 1), `pageSize` (default 10), `mappingName` (optional, partial match, case-insensitive). The response shape SHALL be `{ items: [...], totalCount, page, pageSize }`. Each item SHALL include: `id`, `mappingName`, `createdDate`, `createdBy`, `sourceDataName`, `targetDataName`, `status`.

#### Scenario: Request with default params
- **WHEN** `GET /api/data-mapping` is called without query params
- **THEN** the system SHALL return the first 10 mappings ordered by `createdDate` descending with `totalCount`, `page = 1`, `pageSize = 10`

#### Scenario: Request with mappingName filter
- **WHEN** `GET /api/data-mapping?mappingName=foo` is called
- **THEN** only mappings whose `MappingName` contains "foo" (case-insensitive) SHALL be returned

#### Scenario: Request with page and pageSize
- **WHEN** `GET /api/data-mapping?page=2&pageSize=5` is called
- **THEN** the system SHALL return items 6–10 (the second page of 5) and the response SHALL reflect `page = 2`, `pageSize = 5`

### Requirement: Frontend displays live paginated list at /mappings-list
The `/mappings-list` page SHALL fetch data from `GET /api/data-mapping` and render a grid with columns: Mapping Name, Source Data, Target Data, Created Date, Created By, Status. The page SHALL support pagination controls (first, previous, next, last) and a debounced filter input for Mapping Name.

#### Scenario: Page loads with data
- **WHEN** a user navigates to `/mappings-list`
- **THEN** the grid SHALL display rows from `GET /api/data-mapping?page=1&pageSize=10`

#### Scenario: User filters by mapping name
- **WHEN** the user types in the filter input and waits 350 ms
- **THEN** the grid SHALL reload with `mappingName=<input>` and page SHALL reset to 1

#### Scenario: Pagination controls change page
- **WHEN** the user clicks next/previous/first/last page buttons
- **THEN** the grid SHALL fetch the corresponding page from the API

### Requirement: Navigable status gate on list rows
Mapping Name cells SHALL be clickable links (to `/mappings-list/{id}`) only when `status` is `Verifying` or `Verified`. All other statuses SHALL render as plain text with a tooltip explaining the detail view is not yet available.

#### Scenario: Status is Verifying or Verified
- **WHEN** a mapping row has `status = Verifying` or `status = Verified`
- **THEN** the Mapping Name cell SHALL render as a link to `/mappings-list/{id}`

#### Scenario: Status is New, Processing, or other
- **WHEN** a mapping row has any status other than `Verifying` or `Verified`
- **THEN** the Mapping Name cell SHALL render as plain text (not a link)
