## MODIFIED Requirements

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

### Requirement: DataMappingDetail API response uses NormalizeColumnData for descriptions
The `GET /api/data-mappings/{id}/details` endpoint SHALL return `SourceDescription` sourced from `SourceData.NormalizeColumnData` and `TargetDescription` sourced from `TargetData.NormalizeColumnData` (null when no target match exists). The field names in the JSON response (`sourceDescription`, `targetDescription`) SHALL remain unchanged.

#### Scenario: Matched row — descriptions show normalized text
- **WHEN** a client fetches mapping details for a mapping where source and target are matched
- **THEN** `sourceDescription` SHALL equal the source row's `NormalizeColumnData` value and `targetDescription` SHALL equal the target row's `NormalizeColumnData` value

#### Scenario: Unmatched row — target description is null
- **WHEN** a client fetches mapping details for a row where `TargetDataId` is null
- **THEN** `targetDescription` SHALL be null and `sourceDescription` SHALL equal the source row's `NormalizeColumnData` value
