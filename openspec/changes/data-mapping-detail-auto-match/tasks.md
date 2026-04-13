## 1. Infrastructure — PostgreSQL 17 & pg_textsearch Setup

- [ ] 1.1 Update `docker-compose.yml`: change `timescale/timescaledb:latest-pg16` to `timescale/timescaledb:latest-pg17`
- [ ] 1.2 Recreate the TimescaleDB container (`docker compose down && docker compose up -d`) and verify PG17 is running
- [ ] 1.3 Verify `pg_textsearch` is available: connect to the DB and run `CREATE EXTENSION IF NOT EXISTS pg_textsearch;`

## 2. Domain — Core Entities & Enums

- [ ] 2.1 Add `Completed` value to `DataMappingStatus` enum in `MIMS.Core/Entities/DataMappingStatus.cs`
- [ ] 2.2 Add `MappingType` enum (`Auto = 0`, `Manual = 1`) in `MIMS.Core/Entities/MappingType.cs`
- [ ] 2.3 Create `DataMappingDetail` entity in `MIMS.Core/Entities/DataMappingDetail.cs` with `Id`, `DataMappingId`, `SourceDataId`, `TargetDataId` (nullable), `MappingType`, `IsVerified`

## 3. Infrastructure — EF Configuration & Migration

- [ ] 3.1 Create EF configuration class `DataMappingDetailConfiguration` in `MIMS.Infrastructure/Persistence/Configurations/` with table name, PKs, FKs, and column types
- [ ] 3.2 Add `DbSet<DataMappingDetail> DataMappingDetails` to `AppDbContext`
- [ ] 3.3 Add `DbSet<DataMappingDetail> DataMappingDetails` to `IApplicationDbContext` interface
- [ ] 3.4 Run `dotnet ef migrations add DataMappingDetailAutoMatch --project MIMS.Infrastructure --startup-project MIMS.Api`
- [ ] 3.5 Edit the generated migration to add raw SQL for: `CREATE EXTENSION IF NOT EXISTS pg_textsearch`, the BM25 index `CREATE INDEX ix_data_source_details_bm25 ON "DataSourceDetails" USING bm25("NormalizeColumnData") WITH (text_config = 'english')`, and corresponding `DROP INDEX` / `DROP EXTENSION` in the `Down` method
- [ ] 3.6 Apply migration with `dotnet ef database update --project MIMS.Infrastructure --startup-project MIMS.Api` and verify `DataMappingDetails` table and `ix_data_source_details_bm25` index exist

## 4. Application — Extension Method

- [ ] 4.1 Create `StringExtensions.cs` in `MIMS.Application/Common/Extensions/` with the `CalculateWordAppearancePercentage` extension method matching the reference implementation exactly

## 5. Infrastructure — BM25 Search Helper

- [ ] 5.1 Add `SearchBestTargetAsync(string normalizedText, int targetDataSourceId, CancellationToken ct)` method to `AppDbContext` that executes raw SQL using the `<@>` operator: `SELECT ... FROM "DataSourceDetails" WHERE "DataSourceId" = @targetDataSourceId ORDER BY "NormalizeColumnData" <@> @searchText LIMIT 1`, returning `DataSourceDetail?`

## 6. Application — Event Handler Rewrite

- [ ] 6.1 Rewrite `DataMappingCreatedEventHandler.HandleAsync` to:
  - Load `DataMapping`; log and return if null or `Status != New`
  - Set `Status = Processing`, save
  - Load all `DataSourceDetail` rows for `mapping.SourceDataId`
  - For each source row: call `SearchBestTargetAsync(row.NormalizeColumnData, mapping.TargetDataId, ct)`; apply `CalculateWordAppearancePercentage` tiebreaker if needed
  - Build `DataMappingDetail` list (one per source row, `TargetDataId` = matched DataSource.Id or null)
  - Bulk insert via `dbContext.DataMappingDetails.AddRange(...)` + `SaveChangesAsync`
  - Set `mapping.Status = Completed`, save

## 7. Verification

- [ ] 7.1 Build solution (`dotnet build`) with no errors
- [ ] 7.2 Start services and run API (`dotnet run --project MIMS.Api`)
- [ ] 7.3 Create a `DataMapping` via `POST /api/data-mapping` and verify `DataMappingDetails` rows are populated in the database
- [ ] 7.4 Verify `DataMapping.Status` transitions to `Completed` after the event handler runs
- [ ] 7.5 Verify rows with no BM25 match have `TargetDataId = null`
