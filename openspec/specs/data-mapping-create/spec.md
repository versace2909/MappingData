## ADDED Requirements

### Requirement: User can create a data mapping
The system SHALL allow a user to create a new data mapping by providing a Mapping Name, selecting a Source Data source and a Target Data source from filterable dropdown lists, and submitting via the Run Auto Map button. The system SHALL call `POST /api/data-mapping` and on success navigate away. The initial status of the created record SHALL be `New`.

#### Scenario: Successful mapping creation
- **WHEN** the user enters a Mapping Name, selects distinct Source and Target data sources, and clicks Run Auto Map
- **THEN** the system calls `POST /api/data-mapping` with `{ mappingName, sourceDataId, targetDataId }` and on a 200/201 response displays a success indication

#### Scenario: Same source and target selected
- **WHEN** the user selects the same data source for both Source Data and Target Data
- **THEN** the system SHALL display an inline error message (e.g. "Source and Target cannot be the same") and SHALL disable the Run Auto Map button

#### Scenario: Run Auto Map button disabled without required fields
- **WHEN** any of Mapping Name, Source Data, or Target Data is empty
- **THEN** the Run Auto Map button SHALL be disabled and unclickable

### Requirement: Source and Target dropdowns are filterable
The dropdowns for Source Data and Target Data SHALL be filterable by text input so users can search data source names.

#### Scenario: User filters the dropdown list
- **WHEN** the user types into the search input above a dropdown
- **THEN** the dropdown options SHALL be filtered to only show items whose name contains the typed string (case-insensitive)

### Requirement: Mapping Name input is present
The `/mappings` page SHALL include a text input field for Mapping Name.

#### Scenario: Mapping Name is empty on submit attempt
- **WHEN** the user clicks Run Auto Map without entering a Mapping Name
- **THEN** the button SHALL remain disabled (or show a validation error if already clicked)

### Requirement: Continue to Field Mapping button is removed
The `/mappings` page SHALL NOT contain a "Continue to Field Mapping" button.

#### Scenario: Page renders without Continue button
- **WHEN** the user loads the `/mappings` page
- **THEN** no "Continue to Field Mapping" button SHALL be visible

### Requirement: Backend creates DataMapping record with status New
`POST /api/data-mapping` SHALL create a new `DataMapping` row with Status = `New`, persisting MappingName, SourceDataId, TargetDataId, CreatedDate, and CreatedBy. After persisting, the handler SHALL raise a `DataMappingCreatedEventModel` domain event which the EF Core interceptor writes to the `Outboxes` table in the same transaction. The response SHALL still return `201` with the mapping's `id` and `status = "New"`.

#### Scenario: Valid POST request
- **WHEN** a POST request is sent to `/api/data-mapping` with a valid `{ mappingName, sourceDataId, targetDataId }`
- **THEN** the system SHALL return 201 with the created mapping's `id` and `status = "New"`, and an `Outbox` row with `EventName = "DataMappingCreated"` and `Status = Sent` SHALL exist in the database

#### Scenario: Invalid FK — source or target does not exist
- **WHEN** a POST request references a SourceDataId or TargetDataId that does not exist
- **THEN** the system SHALL return 400 with a descriptive error message and no `Outbox` row SHALL be created

### Requirement: User can open data mapping detail when status is Verifying or Verified
The system SHALL allow the user to navigate to the data mapping detail page only when the mapping's `DataMappingStatus` is `Verifying` or `Verified`. Mappings with other statuses (e.g., `New`, `Processing`, `Failed`) SHALL NOT have a clickable detail link, or clicking SHALL show an informational message explaining the mapping is not yet ready.

#### Scenario: Mapping status is Verifying
- **WHEN** a data mapping has `Status = Verifying`
- **THEN** the user SHALL be able to navigate to the detail page for that mapping

#### Scenario: Mapping status is Verified
- **WHEN** a data mapping has `Status = Verified`
- **THEN** the user SHALL be able to navigate to the detail page for that mapping

#### Scenario: Mapping status is New or Processing
- **WHEN** a data mapping has `Status = New` or `Status = Processing`
- **THEN** the detail navigation SHALL be disabled or display a message indicating processing is in progress
