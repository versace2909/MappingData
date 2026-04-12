## ADDED Requirements

### Requirement: Recent data sources API endpoint
The system SHALL expose a `GET /api/data-sources/recent` endpoint that returns the most recent data sources uploaded by users, limited to a maximum of 10 records sorted by upload date descending.

#### Scenario: Retrieve recent data sources with no filter
- **WHEN** a GET request is made to `/api/data-sources/recent` with no query parameters
- **THEN** the endpoint SHALL return HTTP 200 with a JSON array of up to 10 data source records, ordered by `uploadDate` descending

#### Scenario: Retrieve recent data sources filtered by source name
- **WHEN** a GET request is made to `/api/data-sources/recent?sourceName=<value>`
- **THEN** the endpoint SHALL return HTTP 200 with up to 10 records whose `dataSourceName` contains `<value>` (case-insensitive), ordered by `uploadDate` descending

#### Scenario: No matching records
- **WHEN** a GET request is made with a `sourceName` filter that matches no records
- **THEN** the endpoint SHALL return HTTP 200 with an empty JSON array

---

### Requirement: Recent data sources response model
Each record in the recent data sources response SHALL include the source name, upload date, file size, and a download URL for the original uploaded file.

#### Scenario: Response fields are present and correctly typed
- **WHEN** the endpoint returns a non-empty result
- **THEN** each record SHALL contain:
  - `dataSourceName` (string): the name given to the data source at upload time
  - `uploadDate` (ISO 8601 datetime string): the date and time the file was uploaded
  - `fileSize` (number): the size of the uploaded file in bytes
  - `downloadUrl` (string): a pre-signed URL valid for at least 1 hour that triggers a download of the original file

---

### Requirement: Download pre-signed URL generation
The backend SHALL generate a time-limited pre-signed S3 URL for each data source record returned by the recent data sources endpoint.

#### Scenario: Pre-signed URL is valid and triggers download
- **WHEN** the user clicks the download button for a data source record
- **THEN** the browser SHALL initiate a download of the original uploaded file using the `downloadUrl` from the API response

#### Scenario: Pre-signed URL expiry
- **WHEN** a pre-signed URL is generated
- **THEN** it SHALL remain valid for at least 1 hour from the time it was generated

---

### Requirement: Frontend recent data sources table
The `data-sources/upload` screen SHALL display a "Recent Data Sources" table populated from the `GET /api/data-sources/recent` API, showing source name, upload date, file size, and a download action button.

#### Scenario: Table loads on page mount
- **WHEN** the user navigates to the `data-sources/upload` page
- **THEN** the table SHALL automatically fetch and display up to 10 recent data sources

#### Scenario: Table shows empty state
- **WHEN** the API returns an empty array
- **THEN** the table SHALL display a message indicating no data sources have been uploaded yet

#### Scenario: Table shows loading state
- **WHEN** the API request is in flight
- **THEN** the table SHALL display a loading indicator or skeleton state

#### Scenario: Download button triggers file download
- **WHEN** the user clicks the download button in the Actions column of a row
- **THEN** the browser SHALL initiate a download of the original uploaded file

---

### Requirement: Source name filter with debounce
The "Recent Data Sources" table on the `data-sources/upload` screen SHALL include a text input that filters results by source name, with a 300ms debounce before the API call is fired.

#### Scenario: User types in the filter input
- **WHEN** the user types characters into the source name filter input
- **THEN** the system SHALL wait 300ms after the last keystroke before sending a request to `GET /api/data-sources/recent?sourceName=<value>`

#### Scenario: Filter input is cleared
- **WHEN** the user clears the filter input
- **THEN** the system SHALL fetch and display the unfiltered list of recent data sources after the 300ms debounce

#### Scenario: Filter is applied in real-time after debounce
- **WHEN** the debounce period elapses after the user stops typing
- **THEN** the table SHALL update to show only records whose source name contains the entered text (case-insensitive)
