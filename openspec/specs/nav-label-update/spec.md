## ADDED Requirements

### Requirement: Sidebar shows correct navigation labels
The sidebar navigation SHALL display "DataSource List" for the data sources link and "Mapping List" for the mapping list link.

#### Scenario: DataSource List label is shown
- **WHEN** the user views the sidebar
- **THEN** the link to `/data-sources` SHALL display the label "DataSource List"

#### Scenario: Mapping List label is shown
- **WHEN** the user views the sidebar
- **THEN** the link SHALL display the label "Mapping List" and route to `/mappings-list`

### Requirement: Mapping list page is accessible at /mappings-list
The Next.js application SHALL serve the mapping list page at the route `/mappings-list`.

#### Scenario: Navigating to /mappings-list
- **WHEN** the user navigates to `/mappings-list`
- **THEN** the mapping list page SHALL render without a 404 error

#### Scenario: Old /archived route is no longer used
- **WHEN** the sidebar is rendered
- **THEN** no link SHALL point to `/archived`
