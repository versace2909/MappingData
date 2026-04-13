## Context

`DataSourceDetail.NormalizeColumnData` exists in the database schema but is currently populated only by `TextNormalizer.Normalize`, which does nothing more than lowercase + whitespace collapse. This means the column carries no pharmaceutical domain knowledge, making it useless for meaningful fuzzy field-matching between source and target datasets.

The existing `TextNormalizer` in `MIMS.Application/Common/Helpers/` is the single call-site that sets `NormalizeColumnData` during upload. Extending it to delegate to a richer normalizer is the minimal-surface change.

## Goals / Non-Goals

**Goals:**
- Introduce `PharmaceuticalTextNormalizer` — a deterministic, snapshot-isolated normalizer that expands units, dosage-form abbreviations, concentration patterns, and glued tokens.
- Initialize it once at startup with hardcoded lookup dictionaries (no DB round-trip).
- Route `TextNormalizer.Normalize` through `PharmaceuticalTextNormalizer.Normalize` so all upload paths pick up the richer output automatically.
- Populate `NormalizeColumnData` on every `DataSourceDetail` row during file upload.

**Non-Goals:**
- Loading/refreshing lookup dictionaries from the database (deferred; `Initialize` accepts dictionaries so the call-site in `Program.cs` can be swapped later).
- Frontend changes.
- New API endpoints or response-shape changes.
- Re-normalizing existing rows already in the database.
- Unit tests (not in scope for this change).

## Decisions

### Decision 1 — Place `PharmaceuticalTextNormalizer` in `MIMS.Application`

**Chosen**: `MIMS.Application/Common/Helpers/PharmaceuticalTextNormalizer.cs`

**Rationale**: The normalizer is pure logic with no infrastructure dependencies (no EF, no S3, no HTTP). Application layer is correct; Infrastructure is for I/O adapters. `TextNormalizer` already lives in `MIMS.Application/Common/Helpers/` — co-locating keeps the helpers together.

**Alternative considered**: `MIMS.Infrastructure` — rejected because it would create an upward dependency from Application → Infrastructure for a logic-only concern.

### Decision 2 — Snapshot pattern for thread safety

**Chosen**: A single `volatile NormalizerSnapshot?` field updated atomically under a lock on `Initialize`. Readers see either null (not yet initialized) or a fully constructed immutable snapshot — no torn reads.

**Rationale**: `Initialize` is called once at startup before the server handles requests. The snapshot is immutable after construction so reads are lock-free after the first write.

**Alternative considered**: `Lazy<T>` — less flexible because it can't be re-initialized if we ever want to hot-reload dictionaries from a DB in the future.

### Decision 3 — Hardcode dictionaries in `Program.cs`, call `Initialize` at startup

**Chosen**: Call `PharmaceuticalTextNormalizer.Initialize(unitExpansions, gluedTokens, ...)` in `Program.cs` before `app.Run()`, passing in-memory dictionaries.

**Rationale**: Keeps the normalizer itself free of any startup/DI concerns. The dictionaries are stable pharmaceutical vocabulary — not user data — so hardcoding is acceptable now. The `Initialize` signature already accepts dictionaries, making it trivial to swap the source to a DB query later.

### Decision 4 — `TextNormalizer.Normalize` becomes a thin wrapper

**Chosen**: Replace the current implementation of `TextNormalizer.Normalize` with a single call to `PharmaceuticalTextNormalizer.Normalize(input)`.

**Rationale**: `TextNormalizer` is the single call-site in `UploadDataSourceCommand`. Keeping `TextNormalizer` as the public API means no changes needed in the command handler or any future callers.

### Decision 5 — Normalization pipeline order

The pipeline runs in this sequence to avoid interference between steps:
1. Whitespace collapse + thousands-comma removal + percentage gluing
2. Concentration pattern expansion (`%w/v` → `% weight per volume`)
3. Dosage ratio expansion (`200mg/5mL` → `200 milligram per 5 milliliter`)
4. Glued token splitting (`500mg` → `500 milligram`, `60millioncells` → `60 million cells`)
5. Hyphenated dosage form expansion (`DT-Tab` → `dispersible tablet`)
6. Multi-word abbreviation expansion (`film-coated tab` → `film-coated tablet`)
7. Single-word abbreviation expansion (`tab` → `tablet`)
8. Special-character removal (brackets stripped but content kept; bare `/` → ` / `; commas → space)
9. Final lowercase + whitespace collapse

**Rationale**: Ratio/unit expansions must run before abbreviation expansion so that unit tokens like `mL` are expanded before the single-word pass can accidentally match fragments. Hyphenated forms run before multi-word and single-word passes to prevent partial matches.

## Risks / Trade-offs

- **[Risk] Static mutable state** — `PharmaceuticalTextNormalizer` uses a static field. In test scenarios, tests that call `Initialize` with different dictionaries could interfere.
  → **Mitigation**: acceptable for now since the class is designed for single initialization; tests should call `Initialize` in their setup fixture.

- **[Risk] Case-sensitivity in unit alternation regex** — The regex alternation is built from dictionary keys; units like `mL`, `IU`, `MIU` require case-insensitive matching to avoid missing variants.
  → **Mitigation**: All regexes are compiled with `RegexOptions.IgnoreCase`.

- **[Risk] Existing rows not re-normalized** — Rows uploaded before this change will have the old (bare lowercase) value in `NormalizeColumnData`.
  → **Mitigation**: Accepted as out of scope. Users can re-upload if needed.

- **[Risk] Startup throws if `Initialize` is not called** — `Normalize` throws `InvalidOperationException` if `_snapshot` is null.
  → **Mitigation**: `Initialize` is called unconditionally in `Program.cs` before `app.Run()`, so the server will not serve requests without initialization.

## Migration Plan

1. Add `PharmaceuticalTextNormalizer.cs` to `MIMS.Application/Common/Helpers/`.
2. Update `TextNormalizer.Normalize` to delegate to `PharmaceuticalTextNormalizer.Normalize`.
3. Add `PharmaceuticalTextNormalizer.Initialize(...)` call in `Program.cs`.
4. Verify `UploadDataSourceCommand` already uses `TextNormalizer.Normalize` — no changes needed if so.
5. Deploy. No DB migration required.

**Rollback**: Revert `TextNormalizer.Normalize` to the original implementation (lowercase + trim). `NormalizeColumnData` falls back to plain lowercase; no data is lost.
