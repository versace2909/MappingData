## 1. Backend — Data Source Detail API

- [x] 1.1 Add `Normalized` property to `DataSourceDetailDto` record (sourced from `NormalizeColumnData`)
- [x] 1.2 Update `GetDataSourceDetailsQueryHandler` to project `NormalizeColumnData` into the `Normalized` field of the DTO

## 2. Backend — Mapping Detail Query

- [x] 2.1 Update `GetDataMappingDetailsQueryHandler` to project `SourceData.NormalizeColumnData` into `SourceDescription`
- [x] 2.2 Update `GetDataMappingDetailsQueryHandler` to project `TargetData.NormalizeColumnData` (nullable) into `TargetDescription`

## 3. Frontend — Data Source Detail Page

- [x] 3.1 Add `normalized` field to the `DataSourceDetailItem` type in `frontend/src/lib/api.ts`
- [x] 3.2 Add `Normalized` column header (`<th>`) to the table in `frontend/src/app/data-sources/[id]/page.tsx`
- [x] 3.3 Add `normalized` cell (`<td>`) to each table row in `frontend/src/app/data-sources/[id]/page.tsx`
- [x] 3.4 Update the empty-state `colSpan` from 3 to 4
