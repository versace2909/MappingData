## Why

After a mapping is created, `MappingConfigurationClient` redirects to `/mappings/${result.id}`, which is a non-existent route. Users land on a 404. The correct destination is `/mappings-list`, where they can see the newly created mapping and track its status.

## What Changes

- **Frontend**: Change `router.push(`/mappings/${result.id}`)` to `router.push('/mappings-list')` in `MappingConfigurationClient.tsx`.

## Capabilities

### New Capabilities
<!-- none -->

### Modified Capabilities
- `auto-map-trigger`: Post-create redirect destination corrected from `/mappings/:id` to `/mappings-list`.

## Impact

- `frontend/src/app/mappings/MappingConfigurationClient.tsx` — one-line redirect fix
