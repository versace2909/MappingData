## 1. Backend — DataMapping Entity & Migration

- [x] 1.1 Create `DataMappingStatus` enum in `MIMS.Core/Entities/` with values: New, Mapping, Verified, Verifying
- [x] 1.2 Create `DataMapping` entity in `MIMS.Core/Entities/` extending `BaseEntity` with properties: MappingName, SourceDataId, TargetDataId, Status, and navigation properties to DataSource
- [x] 1.3 Create `DataMappingConfiguration` in `MIMS.Infrastructure/Persistence/Configurations/` (table name, column mappings, FK constraints, Status stored as string)
- [x] 1.4 Add `DbSet<DataMapping> DataMappings` to `IApplicationDbContext` and `AppDbContext`
- [x] 1.5 Run `dotnet ef migrations add AddDataMapping` and verify the migration file is correct
- [x] 1.6 Run `dotnet ef database update` to apply migration

## 2. Backend — Dropdown Endpoint

- [x] 2.1 Create `DataSourceDropdownItemDto` with `Id` (int) and `Name` (string) in `MIMS.Application/DataSources/Queries/GetDataSourceDropdown/`
- [x] 2.2 Create `GetDataSourceDropdownQuery` (no parameters) and `GetDataSourceDropdownQueryHandler` that returns `List<DataSourceDropdownItemDto>`
- [x] 2.3 Add `GET /api/data-source/list-dropdown` action to `DataSourcesController` calling the query via MediatR

## 3. Backend — Create DataMapping Endpoint

- [x] 3.1 Create `CreateDataMappingCommand` with properties: MappingName, SourceDataId, TargetDataId in `MIMS.Application/DataMappings/Commands/CreateDataMapping/`
- [x] 3.2 Create `CreateDataMappingCommandHandler` that validates FK existence, creates the entity with Status = New, saves, and returns the new mapping id
- [x] 3.3 Create `CreateDataMappingResult` DTO with Id and Status
- [x] 3.4 Create `DataMappingController` at route `api/data-mapping` with `POST /` action returning 201 with the result

## 4. Backend — List DataMappings Endpoint

- [x] 4.1 Create `DataMappingListItemDto` with id, mappingName, createdDate, createdBy, sourceDataName, targetDataName, status
- [x] 4.2 Create `GetDataMappingListQuery` with page, pageSize, mappingName params and `GetDataMappingListQueryHandler` that queries with optional name filter and returns `{ Items, TotalCount, Page, PageSize }`
- [x] 4.3 Add `GET /` action on `DataMappingController` accepting `page`, `pageSize`, `mappingName` query params
- [x] 4.4 Verify backend builds with `dotnet build` (no errors)

## 5. Frontend — Update `/mappings` Page

- [x] 5.1 Add `getDataSourceDropdown` API function to `src/lib/api.ts` calling `GET /api/data-source/list-dropdown`
- [x] 5.2 Add `createDataMapping` API function to `src/lib/api.ts` calling `POST /api/data-mapping`
- [x] 5.3 Update `MappingConfigurationClient.tsx`: fetch dropdown data from the API on mount; replace static mock data props
- [x] 5.4 Replace plain `<select>` dropdowns with filterable combobox components (text search input + filtered option list) for Source Data and Target Data
- [x] 5.5 Add Mapping Name text input field above/between the dropdowns
- [x] 5.6 Add same-source validation: if Source equals Target, show inline error and disable Run Auto Map
- [x] 5.7 Disable Run Auto Map button unless MappingName, SourceDataId, and TargetDataId are all filled and valid
- [x] 5.8 Wire Run Auto Map button to call `createDataMapping` API and handle success/error states
- [x] 5.9 Remove "Continue to Field Mapping" button from the page
- [x] 5.10 Update `page.tsx` for `/mappings` to remove mock data props and pass no static sources/targets

## 6. Frontend — Add `/mappings/[id]` Page

- [x] 6.1 Add `getDataMappingList` API function to `src/lib/api.ts` calling `GET /api/data-mapping` with page, pageSize, mappingName params
- [x] 6.2 Create `app/mappings/[id]/page.tsx` server component
- [x] 6.3 Create `app/mappings/[id]/DataMappingListClient.tsx` client component with: MappingName filter input, paginated data grid (columns: MappingName, CreatedDate, CreatedBy, SourceData Name, TargetData Name, Status), pagination controls
- [x] 6.4 Verify the grid refreshes when filter input changes and pagination works correctly

## 7. Integration & Verification

- [x] 7.1 Run `dotnet build` on the backend solution — confirm zero errors
- [x] 7.2 Run `npm run build` on the frontend — confirm zero errors
- [x] 7.3 Start both services and verify end-to-end: dropdown loads real data sources, creating a mapping persists to DB with status New, list page shows created mappings with pagination and filter
