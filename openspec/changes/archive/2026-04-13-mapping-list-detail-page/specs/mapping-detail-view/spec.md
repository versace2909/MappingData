## ADDED Requirements

### Requirement: Backend exposes paginated DataMappingDetail endpoint
The system SHALL expose `GET /api/data-mapping/{id}/details` that returns a paginated list of `DataMappingDetail` rows for the given mapping. Supported query params: `page` (default 1), `pageSize` (default 20). The response shape SHALL be `{ items: [...], totalCount, page, pageSize }`. Each item SHALL include: `id`, `sourceCode`, `sourceDescription`, `targetCode` (nullable), `targetDescription` (nullable), `mappingType` ("Auto" or "Manual"), `isVerified` (bool), `score` (double, nullable).

#### Scenario: Valid mapping ID returns paginated details
- **WHEN** `GET /api/data-mapping/5/details?page=1&pageSize=20` is called and mapping 5 exists
- **THEN** the system SHALL return HTTP 200 with `items` array, `totalCount`, `page=1`, `pageSize=20`

#### Scenario: Unknown mapping ID returns 404
- **WHEN** `GET /api/data-mapping/9999/details` is called and no mapping with that ID exists
- **THEN** the system SHALL return HTTP 404

#### Scenario: Items include resolved source and target field info
- **WHEN** a `DataMappingDetail` row has `SourceDataId=10` and `TargetDataId=20`
- **THEN** the response item SHALL include `sourceCode` and `sourceDescription` from `DataSourceDetail` with `Id=10`, and `targetCode` and `targetDescription` from `DataSourceDetail` with `Id=20`

#### Scenario: Items with no target match return null target fields
- **WHEN** a `DataMappingDetail` row has `TargetDataId=null`
- **THEN** the response item SHALL include `targetCode=null` and `targetDescription=null`

### Requirement: Frontend detail page at /mappings-list/[id]
The system SHALL provide a Next.js page at `/mappings-list/[id]` that fetches from `GET /api/data-mapping/{id}/details` and renders a table with columns: # (row number), Source Field (code + description), Mapped Target Field (code + description or "UNRESOLVED"), Mapping Type badge, Verified Status. The page SHALL support pagination controls (first, previous, next, last) with a default page size of 20.

#### Scenario: Page loads with detail rows
- **WHEN** a user navigates to `/mappings-list/5`
- **THEN** the page SHALL display a table with rows from `GET /api/data-mapping/5/details?page=1&pageSize=20`

#### Scenario: Source field displays code and description
- **WHEN** a detail row has `sourceCode="USR_9921_X"` and `sourceDescription="Global User Identity"`
- **THEN** the Source Field cell SHALL display `USR_9921_X` in bold monospace and `Global User Identity` as a secondary label below it

#### Scenario: Target field displays code and description when matched
- **WHEN** a detail row has `targetCode="USER_ID_PROD"` and `targetDescription="Unique identifier for end users"`
- **THEN** the Mapped Target Field cell SHALL display `USER_ID_PROD` in bold monospace and `Unique identifier for end users` as a secondary label

#### Scenario: Target field shows UNRESOLVED when no match
- **WHEN** a detail row has `targetCode=null`
- **THEN** the Mapped Target Field cell SHALL display "UNRESOLVED" styled in the error color

#### Scenario: Mapping type badge reflects Auto or Manual
- **WHEN** a detail row has `mappingType="Auto"`
- **THEN** the Mapping Type cell SHALL display an "Auto" badge

#### Scenario: Verified status shows check icon for verified rows
- **WHEN** a detail row has `isVerified=true`
- **THEN** the Verified Status cell SHALL display a check icon and "Verified" label in green

#### Scenario: Verified status shows unverified for unverified rows
- **WHEN** a detail row has `isVerified=false`
- **THEN** the Verified Status cell SHALL display an unfilled circle icon and "Unverified" label

#### Scenario: Pagination controls change page
- **WHEN** the user clicks next/previous/first/last page buttons
- **THEN** the table SHALL reload with the corresponding page of detail rows

#### Scenario: Page not found when mapping ID does not exist
- **WHEN** the API returns 404 for the given mapping ID
- **THEN** the page SHALL display a "Mapping not found" message instead of the table
