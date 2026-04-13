## MODIFIED Requirements

### Requirement: Redirect to mapping list after successful create
After a mapping is successfully created via `POST /api/data-mapping`, the frontend SHALL navigate the user to `/mappings-list`.

#### Scenario: Successful mapping creation redirects to list
- **WHEN** the user submits the mapping configuration form and the API returns a success response
- **THEN** the browser SHALL navigate to `/mappings-list`
