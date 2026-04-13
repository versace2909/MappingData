## ADDED Requirements

### Requirement: pg_textsearch extension enabled
The system SHALL enable the `pg_textsearch` extension in the database. The EF migration SHALL include raw SQL `CREATE EXTENSION IF NOT EXISTS pg_textsearch;` so it is applied automatically on `dotnet ef database update`.

The `docker-compose.yml` SHALL use `timescale/timescaledb:latest-pg17` (or newer) because `pg_textsearch` requires PostgreSQL 17+.

#### Scenario: Extension created via migration
- **WHEN** `dotnet ef database update` runs the migration on a fresh database
- **THEN** `SELECT * FROM pg_extension WHERE extname = 'pg_textsearch'` SHALL return one row

#### Scenario: PG version is 17 or higher
- **WHEN** the TimescaleDB container starts
- **THEN** `SELECT version()` SHALL report PostgreSQL 17 or higher

### Requirement: BM25 index on DataSourceDetail.NormalizeColumnData
The system SHALL create a `pg_textsearch` BM25 index on the `NormalizeColumnData` column of `DataSourceDetails` via raw SQL in the EF migration:

```sql
CREATE INDEX ix_data_source_details_bm25
ON "DataSourceDetails"
USING bm25("NormalizeColumnData")
WITH (text_config = 'english');
```

No additional `tsvector` column or GIN index is required.

#### Scenario: BM25 index created on migration
- **WHEN** `dotnet ef database update` runs the migration
- **THEN** `DataSourceDetails` SHALL have an index named `ix_data_source_details_bm25` of type `bm25`

### Requirement: BM25 search query for best target match
The system SHALL provide a method (on `AppDbContext` or a helper) that, given a `normalizedText` string and a `targetDataSourceId` int, returns the single `DataSourceDetail` (together with its BM25 score) from that data source with the highest score that meets the minimum threshold, or null if no qualifying row exists.

The query SHALL use the `pg_textsearch` `<@>` operator. Because `<@>` returns **negative** values (lower = more relevant), the BM25 score is defined as the negation of that value, obtained via `bm25_get_current_score()`:

```
score = -bm25_get_current_score()   -- called during the BM25 index scan
```

Implementation constraints discovered from pg_textsearch v1.0.0:
- The `NormalizeColumnData` column **must be `text` type** (not `varchar`) — the left operand of `<@>` must be a bare table column with no implicit cast.
- The right side **must use `to_bm25query(@text, 'index_name')`** when the query text is a parameterized value (not a literal); otherwise pg_textsearch cannot resolve the index.
- The score filter (`>= 0.75`) is applied **in application code** after the query returns, not in SQL WHERE (since `bm25_get_current_score()` is only valid inside a scan context).
- SQL column aliases must match the target DTO property names exactly (EF Core `SqlQueryRaw<T>` maps by name, not convention).

```sql
SELECT id                        AS "Id",
       normalize_column_data     AS "NormalizeColumnData",
       -bm25_get_current_score() AS "Score"
FROM data_source_detail
WHERE data_source_id = @targetDataSourceId
ORDER BY normalize_column_data <@> to_bm25query(@searchText, 'ix_data_source_detail_bm25')
LIMIT 2
```

The return type of the helper method SHALL be `(int DetailId, double Score)?` — null when no row qualifies after the 0.75 threshold is applied.

#### Scenario: Single best match found above threshold
- **WHEN** the normalizedText matches one or more target rows with score >= 0.75
- **THEN** the query SHALL return the highest-scored `DataSourceDetail` together with its score

#### Scenario: Match exists but score is below threshold
- **WHEN** the best-matching row's BM25 score is below 0.75
- **THEN** the query SHALL return null (treated as no match)

#### Scenario: No match found
- **WHEN** no target rows produce any BM25 score for the given text
- **THEN** the query SHALL return null

### Requirement: Word-appearance percentage tiebreaker
When two BM25 candidate results have equal `score` values (within floating-point tolerance), the system SHALL use `CalculateWordAppearancePercentage` as a tiebreaker, selecting the candidate with the higher word-appearance percentage. Both candidates must still satisfy the `score >= 0.75` threshold.

`CalculateWordAppearancePercentage(source, target)` is defined as:
```
sourceSplit = source.Split(' ', RemoveEmptyEntries).ToHashSet()
targetSplit = target.Split(' ', RemoveEmptyEntries).ToHashSet()
if sourceSplit.Count == 0: return 0
return (double)sourceSplit.Intersect(targetSplit).Count() / sourceSplit.Count
```

#### Scenario: Tiebreaker applied
- **WHEN** two target candidates have the same BM25 score
- **THEN** the candidate with the higher word-appearance percentage SHALL be selected

### Requirement: CalculateWordAppearancePercentage extension method
The system SHALL define `CalculateWordAppearancePercentage` as a `static` extension method on `string` in `MIMS.Application` (or `MIMS.Core`), matching the reference implementation exactly.

#### Scenario: Empty source string
- **WHEN** the source string is empty or whitespace-only
- **THEN** `CalculateWordAppearancePercentage` SHALL return `0`

#### Scenario: Full overlap
- **WHEN** all words in source appear in target
- **THEN** `CalculateWordAppearancePercentage` SHALL return `1.0`
