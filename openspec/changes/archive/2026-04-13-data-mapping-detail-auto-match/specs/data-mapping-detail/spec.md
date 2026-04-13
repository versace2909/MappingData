## ADDED Requirements

### Requirement: DataMappingDetail entity
The system SHALL define a `DataMappingDetail` entity in `MIMS.Core` with:
- `Id` — int, primary key (auto-increment)
- `DataMappingId` — int, FK to `DataMapping`
- `SourceDataId` — int, FK to `DataSource`
- `TargetDataId` — int?, nullable FK to `DataSource`
- `MappingType` — enum (`Auto`, `Manual`), default `Auto`
- `IsVerified` — bool, default `false`

#### Scenario: Entity created with auto-match result
- **WHEN** the auto-match engine resolves a target for a source row
- **THEN** a `DataMappingDetail` record SHALL be created with `SourceDataId` set, `TargetDataId` set to the matched target's `DataSource.Id`, `MappingType = Auto`, and `IsVerified = false`

#### Scenario: Entity created with no match
- **WHEN** the auto-match engine finds no target match for a source row
- **THEN** a `DataMappingDetail` record SHALL be created with `SourceDataId` set, `TargetDataId = null`, `MappingType = Auto`, and `IsVerified = false`

### Requirement: DataMappingDetail EF configuration
The system SHALL configure `DataMappingDetail` in EF Core:
- Table name `DataMappingDetails`
- `Id` as auto-increment primary key
- `DataMappingId` as a non-nullable FK with cascade delete
- `SourceDataId` as non-nullable FK (no cascade, restrict)
- `TargetDataId` as nullable FK (no cascade, restrict)
- `MappingType` stored as int column
- `IsVerified` as non-nullable bool

#### Scenario: EF migration applies cleanly
- **WHEN** `dotnet ef database update` is run against a fresh database
- **THEN** the `DataMappingDetails` table SHALL exist with all columns and FK constraints

### Requirement: DataMappingDetails DbSet exposed on IApplicationDbContext
`IApplicationDbContext` SHALL expose `DbSet<DataMappingDetail> DataMappingDetails` so application handlers can query and insert records.

#### Scenario: Handler inserts DataMappingDetail via interface
- **WHEN** `DataMappingCreatedEventHandler` calls `dbContext.DataMappingDetails.AddRange(...)` and `SaveChangesAsync`
- **THEN** all records SHALL be persisted in the `DataMappingDetails` table

### Requirement: MappingType enum
The system SHALL define a `MappingType` enum in `MIMS.Core` with values `Auto = 0` and `Manual = 1`.

#### Scenario: Default mapping type for auto-match
- **WHEN** a `DataMappingDetail` is created by the event handler
- **THEN** `MappingType` SHALL equal `Auto`

### Requirement: DataMappingStatus.Completed enum value
The `DataMappingStatus` enum SHALL include a `Completed` value indicating the auto-match pass has finished and the mapping is ready for user review.

#### Scenario: DataMapping reaches Completed status
- **WHEN** all `DataMappingDetail` rows have been inserted
- **THEN** the parent `DataMapping.Status` SHALL be updated to `Completed`
