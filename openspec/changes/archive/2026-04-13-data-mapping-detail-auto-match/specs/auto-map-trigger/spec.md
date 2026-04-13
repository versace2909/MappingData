## MODIFIED Requirements

### Requirement: DataMapping raises DataMappingCreatedEventModel on creation
The `DataMapping` entity SHALL implement `IDomainEventEntities`. The `CreateDataMappingCommandHandler` (or factory method) SHALL call `AddDomainEvent(new DataMappingCreatedEventModel(dataMapping.Id))` immediately after creating the `DataMapping` instance and before calling `SaveChangesAsync`.

`DataMappingCreatedEventModel` SHALL be a record inheriting `BaseEventModel` with `EventName = "DataMappingCreated"` and a `Guid DataMappingId` property.

The `DataMappingCreatedEventHandler` SHALL, upon receiving the event:
1. Load the `DataMapping` (with `SourceDataId` and `TargetDataId`).
2. Verify `Status == New`; skip if not.
3. Set `Status = Processing` and save.
4. Load all `DataSourceDetail` rows for `SourceDataId`.
5. For each source row, run BM25 search against target rows (filtered by `TargetDataId`).
6. Create one `DataMappingDetail` per source row (`TargetDataId` = best match id or null).
7. Bulk-insert all `DataMappingDetail` records.
8. Set `DataMapping.Status = Completed` and save.

#### Scenario: DataMapping created successfully
- **WHEN** `POST /api/data-mapping` is called with valid input and `SaveChangesAsync` completes
- **THEN** the `DataMapping` entity SHALL have had `DataMappingCreatedEventModel` raised, resulting in an `Outbox` row with `EventName = "DataMappingCreated"` and `Status = Sent`

#### Scenario: DataMapping creation fails (DB error)
- **WHEN** `SaveChangesAsync` throws an exception
- **THEN** no `Outbox` row SHALL be persisted (transaction rolled back)

#### Scenario: Auto-match completes successfully
- **WHEN** the event handler processes `DataMappingCreatedEventModel` for a `DataMapping` with status `New`
- **THEN** `DataMappingDetail` rows SHALL be inserted for every source `DataSourceDetail` row and `DataMapping.Status` SHALL become `Completed`

#### Scenario: Event received for already-processed mapping
- **WHEN** the event handler receives the event but `DataMapping.Status != New`
- **THEN** the handler SHALL log and return without making any changes
