## ADDED Requirements

### Requirement: Search screen with data source selector
The system SHALL provide a dedicated page at `/data-source-search` containing a dropdown that lists all available data sources (populated from `GET /api/data-sources`). Selecting a data source SHALL immediately load and display its detail rows in a grid below.

#### Scenario: Page loads with empty dropdown selection
- **WHEN** a user navigates to `/data-source-search` for the first time
- **THEN** the dropdown is visible with a placeholder (e.g., "Select a data source"), the search input is disabled, and the grid is empty

#### Scenario: User selects a data source
- **WHEN** a user picks a data source from the dropdown
- **THEN** the system fetches `GET /api/data-sources/{id}/details/search` with no query string and displays all rows in the grid with columns: `#`, `Primary Field`, `Description`, `Normalized`

#### Scenario: Dropdown is populated with available data sources
- **WHEN** the page mounts
- **THEN** the dropdown lists every data source returned by `GET /api/data-sources`, displaying the file name as the label

### Requirement: Debounced BM25 search input
The page SHALL include a text input field that filters the grid results using BM25 full-text search. The frontend SHALL debounce the input by 300 ms before sending a search request to the backend. When the input is cleared, the full list SHALL be restored.

#### Scenario: User types a search query
- **WHEN** a user types text into the search input and 300 ms have elapsed without further keystrokes
- **THEN** the frontend sends `GET /api/data-sources/{id}/details/search?query=<text>&page=1&pageSize=20` and updates the grid with the ranked results

#### Scenario: User clears the search input
- **WHEN** the user deletes all text from the search input and 300 ms have elapsed
- **THEN** the frontend sends `GET /api/data-sources/{id}/details/search` with no `query` param and the grid reverts to showing all rows

#### Scenario: Rapid keystrokes do not trigger multiple requests
- **WHEN** a user types multiple characters within 300 ms
- **THEN** only one API request is sent after the debounce period ends

#### Scenario: Search input is disabled when no data source is selected
- **WHEN** no data source is chosen in the dropdown
- **THEN** the search input is disabled and the placeholder text indicates a data source must be selected first

### Requirement: BM25-ranked results grid
The search results grid SHALL display rows returned by the search API. When a search query is active, rows SHALL appear in BM25 relevance order (highest rank first). When no query is provided, rows SHALL appear in their default insertion order. The grid SHALL support pagination consistent with the existing detail view.

#### Scenario: Results displayed in relevance order
- **WHEN** the API returns rows with BM25 ranking
- **THEN** the grid shows rows sorted from highest to lowest relevance score, with the index column (`#`) reflecting the position in the current page

#### Scenario: No results for search query
- **WHEN** the search query matches no rows
- **THEN** the grid displays an empty state message (e.g., "No results found")

#### Scenario: Grid pagination
- **WHEN** results exceed the page size (20)
- **THEN** pagination controls are shown and the user can navigate to subsequent pages, with the index column continuing from `(page - 1) * pageSize + 1`
