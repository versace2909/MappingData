## Why

When a `DataMapping` is created, the system currently does nothing to populate matched data. We need to automatically match source data rows to the most relevant target data rows using full-text search (BM25 via pg_trgm/pg_textsearch), persisting results in a new `DataMappingDetail` table so users can review, verify, and export mappings.

## What Changes

- New `DataMappingDetail` entity and table with columns: `Id`, `SourceDataId` (FK → `DataSource`), `TargetDataId` (nullable FK → `DataSource`), `MappingType`, `IsVerified`.
- `DataMappingCreatedEventHandler` updated to iterate all source `DataSourceDetail` rows, perform BM25 full-text search against target rows, pick the single best match (or leave null if none found), and bulk-insert `DataMappingDetail` records.
- Word-appearance percentage helper (`CalculateWordAppearancePercentage`) used as a secondary scoring fallback.
- `DataMapping` status updated to `Completed` after the auto-match pass finishes.

## Capabilities

### New Capabilities

- `data-mapping-detail`: Stores per-row mapping results between source and target data sources, including match confidence metadata and verification state.
- `auto-match-engine`: Runs BM25 full-text search at mapping creation time to automatically populate `DataMappingDetail` with best-match target rows.

### Modified Capabilities

- `auto-map-trigger`: The event handler that fires on mapping creation now does real work (populates `DataMappingDetail`) instead of being a stub.

## Impact

- **New EF migration** required for `DataMappingDetail` table and BM25 index.
- **`MIMS.Core`**: New `DataMappingDetail` entity.
- **`MIMS.Infrastructure`**: EF config for new entity; BM25 full-text index on `DataSourceDetail.NormalizedData`; raw SQL search helper on `AppDbContext`.
- **`MIMS.Application`**: `DataMappingCreatedEventHandler` rewritten with auto-match logic.
- **No API or frontend changes** required for this change.
