## Context

`MappingConfigurationClient.tsx` calls `router.push(`/mappings/${result.id}`)` after a successful mapping creation. The route `/mappings/[id]` does not exist; the mapping detail page lives at `/mappings-list/[id]`. The correct post-create destination is `/mappings-list` (the list page), where the user can see the new mapping and monitor its processing status.

## Goals / Non-Goals

**Goals:**
- Navigate to `/mappings-list` after successful mapping creation.

**Non-Goals:**
- No changes to the API, backend, or any other frontend page.

## Decisions

### Decision: Redirect to `/mappings-list` rather than `/mappings-list/{id}`
**Rationale**: The mapping status is `Processing` immediately after creation — the detail view may show an empty or in-progress state. The list page gives the user a better overview and lets them navigate to the detail when ready.

## Risks / Trade-offs

- No risks. Single-line change with no side effects.
