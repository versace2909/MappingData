## Why

The `NormalizeColumnData` field on `DataSourceDetail` is currently left empty during file upload, making it useless for downstream field-matching. A deterministic, domain-aware normalizer is needed to expand pharmaceutical abbreviations, units, and dosage-form codes into canonical long-form text so that fuzzy matching across source/target datasets produces meaningful results.

## What Changes

- Add `PharmaceuticalTextNormalizer` static class to `MIMS.Application` (or `MIMS.Infrastructure`) containing the full normalization pipeline (unit expansion, dosage-ratio expansion, glued-token splitting, hyphenated form expansion, multi-word and single-word abbreviation expansion, special-character removal, lowercase).
- Update `TextNormalizer.Normalize` to delegate to `PharmaceuticalTextNormalizer.Normalize`.
- Call `PharmaceuticalTextNormalizer.Initialize(...)` once at application startup (`Program.cs`) with hardcoded lookup dictionaries (unit expansions, glued tokens, hyphenated dosage forms, multi-word abbreviations, single-word abbreviations).
- Update `UploadDataSourceCommand` handler: after parsing each row, call `TextNormalizer.Normalize(description)` and assign the result to `DataSourceDetail.NormalizeColumnData`.

## Capabilities

### New Capabilities

- `pharmaceutical-text-normalizer`: Domain-specific text normalization pipeline for pharmaceutical product descriptions — expands units, abbreviations, dosage forms, and concentration patterns into canonical long-form text.

### Modified Capabilities

- `data-source-upload`: `NormalizeColumnData` on each `DataSourceDetail` row is now populated during upload instead of left null/empty.

## Impact

- **Backend — new file**: `MIMS.Application/Common/PharmaceuticalTextNormalizer.cs` (or `MIMS.Infrastructure`).
- **Backend — modified**: `MIMS.Application/Common/TextNormalizer.cs` — `Normalize` delegates to `PharmaceuticalTextNormalizer`.
- **Backend — modified**: `MIMS.Api/Program.cs` — one-time `PharmaceuticalTextNormalizer.Initialize(...)` call at startup.
- **Backend — modified**: `UploadDataSourceCommand` handler — sets `NormalizeColumnData` for each parsed row.
- **No API contract changes**, no frontend changes, no new migrations (column already exists).
