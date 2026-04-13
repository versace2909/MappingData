## MODIFIED Requirements

### Requirement: Backend creates DataMapping record with status New
`POST /api/data-mapping` SHALL create a new `DataMapping` row with Status = `New`, persisting MappingName, SourceDataId, TargetDataId, CreatedDate, and CreatedBy. After persisting, the handler SHALL raise a `DataMappingCreatedEventModel` domain event which the EF Core interceptor writes to the `Outboxes` table in the same transaction. The response SHALL still return `201` with the mapping's `id` and `status = "New"`.

#### Scenario: Valid POST request
- **WHEN** a POST request is sent to `/api/data-mapping` with a valid `{ mappingName, sourceDataId, targetDataId }`
- **THEN** the system SHALL return 201 with the created mapping's `id` and `status = "New"`, and an `Outbox` row with `EventName = "DataMappingCreated"` and `Status = Sent` SHALL exist in the database

#### Scenario: Invalid FK — source or target does not exist
- **WHEN** a POST request references a SourceDataId or TargetDataId that does not exist
- **THEN** the system SHALL return 400 with a descriptive error message and no `Outbox` row SHALL be created

## ADDED Requirements

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
