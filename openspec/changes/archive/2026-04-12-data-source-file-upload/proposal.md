## Why

The system needs a way for users to bulk-import data sources via structured spreadsheet files (XLSX/XLS/CSV). Currently there is no mechanism to upload, validate, and persist data source records — this change introduces that capability end-to-end, from the frontend upload UI through backend validation, S3 storage, and database persistence.

## What Changes

- New `data_source` table to store metadata for each uploaded file (name, file info, audit fields).
- New `data_source_detail` table to store each row from the uploaded file, including a normalized column derived from the description.
- New `FileController` endpoint (`POST /api/data-sources/upload`) that accepts a multipart file and a data source name, validates the file format and content, uploads the raw file to S3 (LocalStack in development), and inserts all rows into the database.
- Frontend upload screen (`data-sources/upload`) with drag-and-drop / click-to-select file input (xlsx, xls, csv only), data source name input field, and a downloadable template file.
- EFCore database migrations for the two new tables.
- Docker Compose configuration for LocalStack to simulate S3 in development.

## Capabilities

### New Capabilities

- `data-source-upload`: End-to-end file upload flow — frontend file selection & validation, template download, backend file validation (format, template compliance, duplicate check, non-empty data), S3 storage via LocalStack, and bulk insert into `data_source` + `data_source_detail` tables with normalization of the description column.

### Modified Capabilities

## Impact

- **Backend**: New `FileController`, new service layer for upload/validation/import, new EFCore entities and DbContext factory registration, EFCore migration, AWS S3 client configuration pointing at LocalStack.
- **Frontend**: New upload screen at `data-sources/upload` with file drag-and-drop component, name field, template download link.
- **Infrastructure**: LocalStack service added to `docker-compose.yml` to simulate S3 bucket in development.
- **Database**: Two new tables (`data_source`, `data_source_detail`) added via EFCore migration.
- **Dependencies**: `EPPlus` or `ClosedXML` (XLSX parsing), `CsvHelper` (CSV parsing), `AWSSDK.S3` (S3 client).
