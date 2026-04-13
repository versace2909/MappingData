### Requirement: File type restriction on frontend
The system SHALL restrict file selection to `.xlsx`, `.xls`, and `.csv` files only. No other file types SHALL be selectable or accepted.

#### Scenario: User opens file dialog
- **WHEN** user clicks the upload area or the "browse your files" link
- **THEN** the system file dialog SHALL only show files with `.xlsx`, `.xls`, or `.csv` extensions

#### Scenario: User drags an unsupported file type
- **WHEN** user drags and drops a file with an extension other than `.xlsx`, `.xls`, or `.csv`
- **THEN** the system SHALL display an inline error message stating the file type is not supported and SHALL NOT proceed with upload

#### Scenario: Only one file at a time
- **WHEN** user selects or drops multiple files simultaneously
- **THEN** the system SHALL accept only the first file and ignore the rest, or display an error indicating only one file is allowed

---

### Requirement: Data source name input
The system SHALL require the user to provide a non-empty data source name before the file can be submitted.

#### Scenario: Submit without a name
- **WHEN** user attempts to submit the upload form without entering a data source name
- **THEN** the system SHALL display a validation error on the name field and SHALL NOT send the request to the backend

#### Scenario: Submit with a valid name
- **WHEN** user has entered a non-empty data source name and selected a valid file
- **THEN** the submit button SHALL become active and the form SHALL be submittable

---

### Requirement: Template download
The system SHALL provide a downloadable template file so users know the expected format.

#### Scenario: User downloads template
- **WHEN** user clicks the "Download Template" link or button on the upload screen
- **THEN** the browser SHALL download an `.xlsx` file containing a header row with exactly two columns: `primary` and `description`

---

### Requirement: Backend file extension validation
The backend SHALL reject any uploaded file whose extension is not `.xlsx`, `.xls`, or `.csv`.

#### Scenario: Unsupported extension uploaded
- **WHEN** a request is received with a file whose extension is not `.xlsx`, `.xls`, or `.csv`
- **THEN** the endpoint SHALL return HTTP 400 with an error message indicating the unsupported file type

---

### Requirement: Template compliance validation
The backend SHALL verify that the uploaded file conforms to the expected template structure before processing its data.

#### Scenario: File has correct columns
- **WHEN** the uploaded file's first row contains exactly the headers `primary` and `description` (case-insensitive)
- **THEN** the system SHALL proceed to data validation

#### Scenario: File is missing required columns
- **WHEN** the uploaded file's first row does not contain both `primary` and `description` columns
- **THEN** the endpoint SHALL return HTTP 400 with an error message listing the missing or unexpected column names

#### Scenario: File has extra columns
- **WHEN** the uploaded file contains more than the two required columns
- **THEN** the endpoint SHALL return HTTP 400 indicating the file does not match the template

---

### Requirement: Non-empty data validation
The backend SHALL reject files that contain no data rows after the header.

#### Scenario: File with only a header row
- **WHEN** the uploaded file contains a header row but zero data rows
- **THEN** the endpoint SHALL return HTTP 400 with an error message stating the file contains no data

---

### Requirement: No duplicate primary column values
The backend SHALL reject files where the `primary` column contains duplicate values.

#### Scenario: File has duplicate primary values
- **WHEN** the uploaded file contains two or more rows with the same value in the `primary` column (case-insensitive comparison)
- **THEN** the endpoint SHALL return HTTP 400 with an error message identifying the duplicate value(s)

#### Scenario: File has unique primary values
- **WHEN** all values in the `primary` column are unique (case-insensitive)
- **THEN** the system SHALL proceed to storage and import

---

### Requirement: File stored in S3
The backend SHALL upload the validated raw file to S3 (LocalStack in development) before inserting database records.

#### Scenario: Successful S3 upload
- **WHEN** the file passes all validations
- **THEN** the system SHALL upload the file to the configured S3 bucket under the key `data-sources/{dataSourceId}/{originalFileName}` and SHALL proceed to database insertion

#### Scenario: S3 upload failure
- **WHEN** the S3 upload fails (e.g. LocalStack is unavailable)
- **THEN** the endpoint SHALL return HTTP 503 with an error message and SHALL NOT insert any database records

---

### Requirement: Data source record created
The backend SHALL create a record in the `data_source` table upon successful file upload and import.

#### Scenario: Record inserted after successful upload
- **WHEN** the file passes all validations and is stored in S3
- **THEN** a row SHALL be inserted into `data_source` with: `data_source_name` (from form), `file_name` (original filename), `file_size` (bytes), `file_extension`, `created_by`, `created_date`

---

### Requirement: Data source detail records created
The backend SHALL insert one row per data row from the file into the `data_source_detail` table.

#### Scenario: Rows imported from valid file
- **WHEN** the file passes all validations and the `data_source` record is created
- **THEN** one row SHALL be inserted into `data_source_detail` for each data row, with: `data_source_id` (FK), `primary_column_data`, `description_column_data`, `normalize_column_data`, `created_by`, `created_date`

---

### Requirement: Description normalization
The backend SHALL populate `normalize_column_data` by normalizing the `description_column_data` value.

#### Scenario: Normalization applied on insert
- **WHEN** a `data_source_detail` row is inserted
- **THEN** `normalize_column_data` SHALL be the `description_column_data` value converted to lowercase, with leading/trailing whitespace trimmed and consecutive internal whitespace collapsed to a single space

---

### Requirement: Successful upload response
The backend SHALL return a success response after the import completes.

#### Scenario: All steps complete successfully
- **WHEN** the file is validated, stored in S3, and all rows are inserted into the database
- **THEN** the endpoint SHALL return HTTP 200 (or 201) with the created `data_source` id and `data_source_name`

---

### Requirement: LocalStack S3 available in development
The development environment SHALL include a LocalStack service that simulates AWS S3.

#### Scenario: LocalStack starts with Docker Compose
- **WHEN** `docker-compose up` is run in the development environment
- **THEN** LocalStack SHALL start on port 4566 and the `mims-data-sources` S3 bucket SHALL be created automatically via an init script

---

### Requirement: Frontend drag-and-drop upload
The upload screen SHALL support dragging a file from the filesystem and dropping it onto the upload zone. The upload page SHALL be rendered in a two-column layout: the left column SHALL contain the data source name input and the drag-and-drop upload zone, and the right column SHALL contain supplementary information or instructions (e.g. template download, format guidance). The two columns SHALL be displayed side by side on desktop viewports.

#### Scenario: User drops a valid file
- **WHEN** user drags a `.xlsx`, `.xls`, or `.csv` file and drops it onto the upload zone
- **THEN** the file SHALL be selected and its name SHALL be displayed in the UI, ready for submission

#### Scenario: User clicks to browse
- **WHEN** user clicks anywhere in the upload zone
- **THEN** the system file dialog SHALL open, filtered to `.xlsx`, `.xls`, `.csv` files

#### Scenario: Page renders in two-column layout
- **WHEN** a user navigates to the upload page on a desktop viewport
- **THEN** the page SHALL render with the form controls (name input and upload zone) in the left column and supplementary content in the right column, displayed side by side

---

### Requirement: EF Core database migration
The system SHALL manage database schema changes through EF Core migrations.

#### Scenario: Migration creates required tables
- **WHEN** `dotnet ef database update` is run against a fresh database
- **THEN** the `data_source` and `data_source_detail` tables SHALL be created with all specified columns and constraints (PK, FK, NOT NULL where required)
