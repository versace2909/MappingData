## MODIFIED Requirements

### Requirement: Fetch paginated data source details by ID with optional BM25 search
The system SHALL provide an API endpoint `GET /api/data-sources/{id}/details/search` that accepts an optional `query` string parameter in addition to `page` and `pageSize`. When `query` is provided and non-empty, the endpoint SHALL return rows ranked by BM25 relevance (using PostgreSQL `ts_rank` on the `search_vector` generated column). When `query` is absent or empty, the endpoint SHALL return all rows for the given `dataSourceId` ordered by `Id`. Each record SHALL include `primary` (mapped from `PrimaryColumnData`), `description` (mapped from `DescriptionColumnData`), and `normalized` (mapped from `NormalizeColumnData`). The default page size SHALL be 20 items per page.

#### Scenario: Fetch all rows with no query (empty search)
- **WHEN** a client requests `GET /api/data-sources/{id}/details/search` with no `query` param
- **THEN** the system returns a paginated response with up to 20 items ordered by `Id`, including `page`, `pageSize`, `totalCount`, and each item's `primary`, `description`, and `normalized` fields

#### Scenario: Fetch BM25-ranked rows with a query
- **WHEN** a client requests `GET /api/data-sources/{id}/details/search?query=aspirin&page=1&pageSize=20`
- **THEN** the system returns rows whose `search_vector` matches the tsquery derived from "aspirin", ordered by `ts_rank` descending, with correct `totalCount`

#### Scenario: Query matches no rows
- **WHEN** a client requests `GET /api/data-sources/{id}/details/search?query=zzznomatch`
- **THEN** the system returns an empty `items` array with `totalCount: 0`

#### Scenario: Data source has no detail records
- **WHEN** a client requests details for a valid `dataSourceId` with no `DataSourceDetail` records
- **THEN** the system returns an empty `items` array with `totalCount: 0`

#### Scenario: Fetch a specific page of BM25 results
- **WHEN** a client requests `GET /api/data-sources/{id}/details/search?query=paracetamol&page=2&pageSize=20`
- **THEN** the system returns items 21–40 from the ranked result set with `page: 2`
