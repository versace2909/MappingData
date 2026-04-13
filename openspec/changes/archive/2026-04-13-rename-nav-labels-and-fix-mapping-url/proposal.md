## Why

The sidebar navigation labels "Active Projects" and "Archived" do not accurately reflect the pages they link to, causing confusion. Additionally, the route `mappings/[id]` implies a mapping detail page that has not been implemented yet; it should be renamed to `mappings-list` to match its actual purpose as a list view.

## What Changes

- Rename the sidebar nav label "Active Projects" → "DataSource List" (links to `/data-sources`)
- Rename the sidebar nav label "Archived" → "Mapping List" and update its href from `/archived` to `/mappings-list`
- Rename the Next.js page directory `src/app/mappings/[id]/` to `src/app/mappings-list/` and update all internal references

## Capabilities

### New Capabilities

None.

### Modified Capabilities

None — these are label and URL changes only; no spec-level behavior changes.

## Impact

- `frontend/src/components/layout/SideNavBar.tsx` — two label and one href update
- `frontend/src/app/mappings/[id]/` — directory renamed to `frontend/src/app/mappings-list/`
- Any internal links or `isActive` checks referencing `mappings/[id]` or `/archived` routes
