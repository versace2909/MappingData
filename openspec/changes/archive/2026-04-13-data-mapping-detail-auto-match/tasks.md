## 1. Infrastructure — PostgreSQL 17 & pg_textsearch Setup

- [x] 1.1 Update `docker-compose.yml`: change `timescale/timescaledb:latest-pg16` to `timescale/timescaledb:latest-pg17`
- [x] 1.2 Recreate the TimescaleDB container (`docker compose down && docker compose up -d`) and verify PG17 is running
- [x] 1.3 Verify `pg_textsearch` is available: connect to the DB and run `CREATE EXTENSION IF NOT EXISTS pg_textsearch;`

## 2. Domain — Core Entities & Enums

- [x] 2.1 Add `Completed` value to `DataMappingStatus` enum in `MIMS.Core/Entities/DataMappingStatus.cs`
- [x] 2.2 Add `MappingType` enum (`Auto = 0`, `Manual = 1`) in `MIMS.Core/Entities/MappingType.cs`
- [x] 2.3 Create `DataMappingDetail` entity in `MIMS.Core/Entities/DataMappingDetail.cs` with `Id`, `DataMappingId`, `SourceDataId`, `TargetDataId` (nullable), `MappingType`, `IsVerified`, `Score` (double, nullable — null when no match)

## 3. Infrastructure — EF Configuration & Migration

- [x] 3.1 Create EF configuration class `DataMappingDetailConfiguration` in `MIMS.Infrastructure/Persistence/Configurations/` with table name, PKs, FKs, and column types
- [x] 3.2 Add `DbSet<DataMappingDetail> DataMappingDetails` to `AppDbContext`
- [x] 3.3 Add `DbSet<DataMappingDetail> DataMappingDetails` to `IApplicationDbContext` interface
- [x] 3.4 Run `dotnet ef migrations add DataMappingDetailAutoMatch --project MIMS.Infrastructure --startup-project MIMS.Api`
- [x] 3.5 Edit the generated migration to add raw SQL for: `CREATE EXTENSION IF NOT EXISTS pg_textsearch`, the BM25 index `CREATE INDEX ix_data_source_details_bm25 ON "DataSourceDetails" USING bm25("NormalizeColumnData") WITH (text_config = 'english')`, and corresponding `DROP INDEX` / `DROP EXTENSION` in the `Down` method
- [x] 3.6 Apply migration with `dotnet ef database update --project MIMS.Infrastructure --startup-project MIMS.Api` and verify `DataMappingDetails` table and `ix_data_source_details_bm25` index exist

## 4. Application — Extension Method

- [x] 4.1 Create `StringExtensions.cs` in `MIMS.Application/Common/Extensions/` with the `CalculateWordAppearancePercentage` extension method matching the reference implementation exactly

## 5. Infrastructure — BM25 Search Helper

- [x] 5.1 Add `SearchBestTargetAsync(string normalizedText, int targetDataSourceId, CancellationToken ct)` method to `AppDbContext` that executes raw SQL using the `<@>` operator. The query must: (a) project `-("NormalizeColumnData" <@> @searchText::text)` as `score`, (b) filter `WHERE score >= 0.75`, (c) order by ascending `<@>` distance, (d) `LIMIT 1`. Return type is `(DataSourceDetail detail, double score)?` — null when no row qualifies.

## 6. Application — Event Handler Rewrite

- [x] 6.1 Rewrite `DataMappingCreatedEventHandler.HandleAsync` to:
  - Load `DataMapping`; log and return if null or `Status != New`
  - Set `Status = Processing`, save
  - Load all `DataSourceDetail` rows for `mapping.SourceDataId`
  - For each source row: call `SearchBestTargetAsync(row.NormalizeColumnData, mapping.TargetDataId, ct)` which returns `(detail, score)?`; apply `CalculateWordAppearancePercentage` tiebreaker if two candidates have equal score (both ≥ 0.75)
  - Build `DataMappingDetail` list (one per source row): `TargetDataId` = matched `DataSourceDetail.Id` or null, `Score` = matched score or null
  - Bulk insert via `dbContext.DataMappingDetails.AddRange(...)` + `SaveChangesAsync`
  - Set `mapping.Status = Completed`, save

## 7. Verification

- [x] 7.1 Build solution (`dotnet build`) with no errors
- [x] 7.2 Start services and run API (`dotnet run --project MIMS.Api`)
- [x] 7.3 Create a `DataMapping` via `POST /api/data-mapping` and verify `DataMappingDetails` rows are populated in the database
- [x] 7.4 Verify `DataMapping.Status` transitions to `Completed` after the event handler runs
- [x] 7.5 Verify rows with no BM25 match have `TargetDataId = null` and `Score = null`
- [x] 7.6 Verify rows whose best BM25 candidate scored below 0.75 also have `TargetDataId = null` and `Score = null`
