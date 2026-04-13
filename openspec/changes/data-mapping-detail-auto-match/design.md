## Context

`DataMappingCreatedEventHandler` currently only flips a `DataMapping` to `Processing` status — the actual auto-matching work was never implemented. A `DataMapping` holds a `SourceDataId` and `TargetDataId`, both pointing to `DataSource` records. Each `DataSource` has many `DataSourceDetail` rows with a `NormalizeColumnData` field produced by `PharmaceuticalTextNormalizer`. The goal is to use the **`pg_textsearch`** extension (Timescale's true BM25 implementation) to automatically find the best-matching target row for every source row and persist results in a new `DataMappingDetail` table.

## Goals / Non-Goals

**Goals:**
- Upgrade the database image to PostgreSQL 17 and enable the `pg_textsearch` extension.
- Create `DataMappingDetail` entity and EF migration.
- Add a `pg_textsearch` BM25 index (`USING bm25`) on `DataSourceDetail.NormalizeColumnData`.
- Implement auto-match logic in `DataMappingCreatedEventHandler`: for each source detail row, query for the highest-ranked target row using the `<@>` operator; store one result per source row (or null if no match).
- Use `CalculateWordAppearancePercentage` as a secondary scoring tiebreaker when the BM25 query returns multiple equal-scored candidates.
- Transition `DataMapping` status to `Completed` after the batch insert.

**Non-Goals:**
- Frontend changes or API endpoints for `DataMappingDetail`.
- Manual re-triggering of auto-match for already-completed mappings.
- Streaming or incremental results — full batch at event time.

## Decisions

### D1: pg_textsearch `USING bm25` index vs. standard GIN/tsvector
**Decision**: Use `pg_textsearch`'s native BM25 index — `CREATE INDEX ... USING bm25(NormalizeColumnData) WITH (text_config='english')` — directly on the text column. No `tsvector` column or GIN index needed.  
**Why**: `pg_textsearch` implements the full BM25 algorithm (term-frequency saturation, length normalization, Block-Max WAND top-k optimization), which standard `ts_rank` does not. It also requires no auxiliary computed column: the index is built directly on the text field, keeping the schema clean. The alternative — a persisted `tsvector` + GIN — gives only binary presence/absence ranking, which is inferior for pharmaceutical text where term frequency matters.

### D2: PostgreSQL 17 requirement
**Decision**: Upgrade `docker-compose.yml` from `timescale/timescaledb:latest-pg16` to `timescale/timescaledb:latest-pg17`.  
**Why**: `pg_textsearch` requires PostgreSQL 17 or 18. PG16 is not supported. The schema is simple enough that this upgrade carries minimal migration risk.

### D3: Raw SQL for BM25 search via `<@>` operator
**Decision**: Use `AppDbContext.Database.SqlQueryRaw<>` for the BM25 search query.  
**Why**: EF Core has no knowledge of the `<@>` operator or `to_bm25query`. LINQ-to-SQL would require custom `DbFunction` mappings — high boilerplate for a single use case. Raw SQL with the `<@>` operator is explicit, readable, and directly uses the index.

The search query pattern:
```sql
SELECT * FROM "DataSourceDetails"
WHERE "DataSourceId" = @targetDataSourceId
ORDER BY "NormalizeColumnData" <@> @searchText
LIMIT 1
```

### D4: One DB round-trip per source row vs. bulk LATERAL JOIN
**Decision**: Issue one parameterised query per source row (sequential).  
**Why**: The number of source rows is typically hundreds to low thousands. A LATERAL JOIN approach is more complex SQL and harder to maintain. Single-row queries keep the handler simple; performance is acceptable for MVP data volumes.

### D5: MappingType and IsVerified initial values
**Decision**: `MappingType` defaults to `Auto`; `IsVerified` defaults to `false`.  
**Why**: All initial rows are system-generated; human review sets `IsVerified = true`. A `MappingType` enum allows future `Manual` override rows.

### D6: Final DataMapping status after auto-match
**Decision**: Transition to `Completed` (add new enum value).  
**Why**: `Mapping` and `Verifying`/`Verified` suggest human workflow stages. `Completed` makes it unambiguous that the automatic pass is done and the mapping is ready for user review.

## Risks / Trade-offs

- **PG16 → PG17 upgrade**: Requires stopping and recreating the TimescaleDB container; existing local dev data will be lost (dev-only risk, no prod data). Mitigation: documented in migration plan.
- **pg_textsearch extension availability**: Must be installed in the PG17 image. The `timescale/timescaledb:latest-pg17` image includes it. Verify with `CREATE EXTENSION pg_textsearch;` on first run.
- **`<@>` operator with WHERE filter**: pg_textsearch uses Block-Max WAND for top-k, but an additional WHERE on `DataSourceId` may cause a post-filter scan. Mitigation: acceptable at current data volume; if profiling reveals issues, switch to a CTE pre-filter pattern.
- **Large source data sets**: Many source rows × one DB query each = many round-trips. Mitigation: acceptable for MVP; add bulk LATERAL JOIN path if needed.
- **BM25 returning no results**: Target dataset may use different vocabulary. Mitigation: `TargetDataId` is nullable; handler logs a warning per unmatched row.
- **DataMappingStatus enum change** (adding `Completed`): Any code switching on the enum must handle the new value. No frontend consumes this yet.

## Migration Plan

1. Update `docker-compose.yml`: change `timescale/timescaledb:latest-pg16` → `timescale/timescaledb:latest-pg17`.
2. Recreate the TimescaleDB container (`docker compose down && docker compose up -d`).
3. Enable extension: add `CREATE EXTENSION IF NOT EXISTS pg_textsearch;` as raw SQL in the EF migration (runs once on `database update`).
4. Add `Completed` to `DataMappingStatus` enum.
5. Add `DataMappingDetail` entity + EF configuration.
6. Add BM25 index on `DataSourceDetails.NormalizeColumnData` via raw SQL in EF migration.
7. Add `DataMappingDetails` `DbSet` to `AppDbContext` + `IApplicationDbContext`.
8. Rewrite `DataMappingCreatedEventHandler` with auto-match logic.
9. Run `dotnet ef migrations add DataMappingDetailAutoMatch` + `dotnet ef database update`.
10. Rollback: `docker compose down`, revert image to pg16, drop migration, redeploy.

## Open Questions

- Should `CalculateWordAppearancePercentage` be used as the primary score instead of BM25, or only as a tiebreaker? (Current design: BM25 primary, word-appearance as tiebreaker.)
- Do we need a minimum BM25 score threshold below which the match is treated as "no match"?, - yes, the score should be 0.75
