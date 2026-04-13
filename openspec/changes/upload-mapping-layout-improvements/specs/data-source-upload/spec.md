## MODIFIED Requirements

### Requirement: Frontend drag-and-drop upload
The upload screen SHALL support dragging a file from the filesystem and dropping it onto the upload zone. The upload screen layout SHALL arrange the upload form (data source name input, drag-and-drop zone, action buttons, and feedback messages) on the left side and the Recent Data Sources table on the right side in a two-column flex row within the `max-w-6xl` container.

#### Scenario: User drops a valid file
- **WHEN** user drags a `.xlsx`, `.xls`, or `.csv` file and drops it onto the upload zone
- **THEN** the file SHALL be selected and its name SHALL be displayed in the UI, ready for submission

#### Scenario: User clicks to browse
- **WHEN** user clicks anywhere in the upload zone
- **THEN** the system file dialog SHALL open, filtered to `.xlsx`, `.xls`, `.csv` files

#### Scenario: Page renders in two-column layout
- **WHEN** the Upload page is loaded
- **THEN** the upload form SHALL appear in the left column and the Recent Data Sources table SHALL appear in the right column side-by-side
