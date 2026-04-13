## ADDED Requirements

### Requirement: User can view all data mappings in a paginated grid
The system SHALL provide a page at `/mappings/{id}` that displays a paginated grid of all data mappings. The grid SHALL include columns: MappingName, CreatedDate, CreatedBy, SourceData Name, TargetData Name, and Status.

#### Scenario: Page loads with data
- **WHEN** a user navigates to `/mappings/{id}`
- **THEN** the system SHALL display a grid with rows fetched from `GET /api/data-mapping?page=1&pageSize=10`

#### Scenario: Pagination controls work
- **WHEN** the user clicks next/previous page or selects a page number
- **THEN** the grid SHALL reload with the appropriate page of data from the API

### Requirement: Mapping list can be filtered by MappingName
The `/mappings/{id}` page SHALL include a text input that filters the grid by MappingName. The filter SHALL be applied by calling the API with the `mappingName` query parameter.

#### Scenario: User types in the filter input
- **WHEN** the user enters text in the MappingName filter input
- **THEN** the grid SHALL refresh to show only mappings whose MappingName contains the entered text (case-insensitive, handled server-side)

#### Scenario: Empty filter shows all results
- **WHEN** the filter input is empty
- **THEN** all data mappings SHALL be returned (subject to pagination)

### Requirement: Backend exposes paginated data mapping list endpoint
`GET /api/data-mapping` SHALL return a paginated list of data mappings. Supported query params: `page` (default 1), `pageSize` (default 10), `mappingName` (optional, partial match). The response shape SHALL be `{ items: [...], totalCount, page, pageSize }`. Each item SHALL include: id, mappingName, createdDate, createdBy, sourceDataName, targetDataName, status.

#### Scenario: Request with default params
- **WHEN** `GET /api/data-mapping` is called without query params
- **THEN** the system SHALL return the first 10 mappings ordered by CreatedDate descending

#### Scenario: Request with mappingName filter
- **WHEN** `GET /api/data-mapping?mappingName=foo` is called
- **THEN** only mappings whose MappingName contains "foo" (case-insensitive) SHALL be returned
