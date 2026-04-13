## MODIFIED Requirements

### Requirement: User can view all data mappings in a paginated grid
The system SHALL provide a page at `/mappings-list` that displays a paginated grid of all data mappings. The grid SHALL include columns: MappingName, CreatedDate, CreatedBy, SourceData Name, TargetData Name, and Status. The table container SHALL use the same visual styling as the Data Sources list: a large box shadow (`0 32px 64px -15px rgba(42,52,57,0.06)`) with no separate border. Table header cells SHALL use `py-4` vertical padding to match the Data Sources list header height.

#### Scenario: Page loads with data
- **WHEN** a user navigates to `/mappings-list`
- **THEN** the system SHALL display a grid with rows fetched from `GET /api/data-mapping?page=1&pageSize=10`

#### Scenario: Pagination controls work
- **WHEN** the user clicks next/previous page or selects a page number
- **THEN** the grid SHALL reload with the appropriate page of data from the API

#### Scenario: Grid header row height matches Data Sources list
- **WHEN** the Mapping List page and the Data Sources list page are viewed
- **THEN** the table header row height SHALL appear visually consistent between both pages
