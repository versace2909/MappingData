## Context

`DataSourceDetail` stores three text fields: `PrimaryColumnData`, `DescriptionColumnData`, and `NormalizeColumnData`. The normalizer produces `NormalizeColumnData` at upload time and the BM25 auto-match engine already queries it. However, two surfaces still use `DescriptionColumnData` where they should use the normalized form:

1. The **data-source detail API** (`GET /api/data-sources/{id}/details`) projects only `Primary` and `Description` — `NormalizeColumnData` is never exposed.
2. The **mapping-detail query** (`GetDataMappingDetailsQueryHandler`) projects `DescriptionColumnData` for both `SourceDescription` and `TargetDescription`, meaning the displayed text does not reflect what the engine used for matching.

This design covers the minimal, non-breaking changes needed to surface `NormalizeColumnData` in both places.

## Goals / Non-Goals

**Goals:**
- Expose `NormalizeColumnData` in the data-source detail API response and in the frontend table.
- Replace `DescriptionColumnData` with `NormalizeColumnData` in `DataMappingDetailItemDto.SourceDescription` / `TargetDescription`.
- Keep existing DTO field names so the frontend mapping detail view requires no breaking rename (only a data change).

**Non-Goals:**
- No schema migration — `NormalizeColumnData` already exists.
- No changes to the BM25 engine or `SearchBestTargetAsync` — those already use `NormalizeColumnData`.
- No renaming of `SourceDescription` / `TargetDescription` fields in `DataMappingDetailItemDto`.

## Decisions

### Decision: Add `Normalized` to `DataSourceDetailDto` rather than replace `Description`
**Rationale**: The raw description is still useful for human review; normalizing removes formatting cues. Adding a third field lets the table display all three pieces of data.
**Alternative considered**: Replace `Description` — rejected because it removes useful context for the user.

### Decision: Replace (not supplement) `DescriptionColumnData` with `NormalizeColumnData` in `DataMappingDetailItemDto`
**Rationale**: The mapping engine already decided matches using normalized text. Displaying raw description in the match table is misleading — users should see what the engine compared. Field names (`SourceDescription`, `TargetDescription`) stay the same to avoid a frontend rename.
**Alternative considered**: Add separate `SourceNormalized` / `TargetNormalized` fields — rejected as over-engineering; the description slot should show the effective match text.

## Risks / Trade-offs

- [Risk] Mapping detail rows that currently display human-readable descriptions will now show normalized (lowercased, abbreviated-expanded) text. Users reviewing old mappings will see a display change. → Mitigation: Normalized text is strictly more informative for match review; acceptable regression.
- [Risk] Existing frontend code reading `item.description` from the data-source detail API continues to work unchanged (additive change). → No mitigation needed.

## Migration Plan

1. Update `DataSourceDetailDto` and `GetDataSourceDetailsQueryHandler` (additive — no migration).
2. Update `GetDataMappingDetailsQueryHandler` to project `NormalizeColumnData` (in-place column swap — no migration).
3. Update `frontend/src/lib/api.ts` type and `frontend/src/app/data-sources/[id]/page.tsx` rendering.
4. No database migration needed.
