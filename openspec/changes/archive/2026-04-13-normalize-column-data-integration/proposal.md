## Why

The `NormalizeColumnData` field is populated and used internally by the BM25 auto-match engine, but it is invisible to users browsing data source records and omitted from mapping detail views. Making normalized text visible closes the gap between what the engine uses and what the user sees, and aligns the mapping detail display with the data that drove the matches.

## What Changes

- **Backend**: `DataSourceDetailDto` gains a `Normalized` field sourced from `NormalizeColumnData`; `GetDataSourceDetailsQueryHandler` projects it.
- **Backend**: `GetDataMappingDetailsQueryHandler` replaces `DescriptionColumnData` with `NormalizeColumnData` for both `SourceDescription` and `TargetDescription` in `DataMappingDetailItemDto`.
- **Frontend**: Data-sources `/{id}` detail table gains a fourth column **Normalized** displaying the normalized text beside Primary and Description.

## Capabilities

### New Capabilities
<!-- none -->

### Modified Capabilities
- `data-source-detail`: API response now includes a `normalized` field; frontend table renders it as a fourth column.
- `data-mapping-detail`: `SourceDescription` and `TargetDescription` fields in the API response are sourced from `NormalizeColumnData` instead of `DescriptionColumnData`.

## Impact

- `MIMS.Application/DataSources/Queries/GetDataSourceDetails/DataSourceDetailDto.cs` — add `Normalized` property
- `MIMS.Application/DataSources/Queries/GetDataSourceDetails/GetDataSourceDetailsQueryHandler.cs` — project `NormalizeColumnData`
- `MIMS.Application/DataMappings/Queries/GetDataMappingDetails/GetDataMappingDetailsQueryHandler.cs` — swap `DescriptionColumnData` → `NormalizeColumnData` for source and target
- `frontend/src/lib/api.ts` — add `normalized` to `DataSourceDetailItem` type
- `frontend/src/app/data-sources/[id]/page.tsx` — add Normalized column header and cell
