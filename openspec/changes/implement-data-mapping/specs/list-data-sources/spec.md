## ADDED Requirements

### Requirement: Dropdown endpoint returns lightweight data source list
The system SHALL expose `GET /api/data-source/list-dropdown` that returns a list of all data sources as `{ id, name }` pairs, suitable for populating dropdown/combobox controls. No pagination is required; the full list SHALL be returned.

#### Scenario: Request returns all data sources
- **WHEN** `GET /api/data-source/list-dropdown` is called
- **THEN** the system SHALL return an array of objects with `id` (int) and `name` (string) for every DataSource record

#### Scenario: No data sources exist
- **WHEN** `GET /api/data-source/list-dropdown` is called and the table is empty
- **THEN** the system SHALL return an empty array `[]` with HTTP 200
