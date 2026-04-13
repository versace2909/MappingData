## Context

The sidebar (`SideNavBar.tsx`) currently has two labels that don't match the pages they represent:
- "Active Projects" links to `/data-sources` — should say "DataSource List"
- "Archived" links to `/archived` — should say "Mapping List" and route to `/mappings-list`

The `mappings/[id]` directory was scaffolded as a future mapping detail page. It is not yet implemented, and its dynamic route name implies detail functionality. The correct route for a mapping list view is `/mappings-list`.

## Goals / Non-Goals

**Goals:**
- Update two sidebar label strings in `SideNavBar.tsx`
- Update the "Archived" nav href from `/archived` to `/mappings-list`
- Rename the Next.js page directory `src/app/mappings/[id]/` → `src/app/mappings-list/`
- Update any `isActive` / `pathname.startsWith` checks that reference the old paths

**Non-Goals:**
- Implementing the Mapping List page content
- Changing any backend routes or API contracts
- Modifying any other navigation items

## Decisions

**Rename directory instead of adding a redirect**: Since `mappings/[id]` has no real users yet (not linked anywhere as a real feature), a simple rename is cleaner than keeping a redirect. No migration needed.

**Keep `/mappings` route untouched**: The `/mappings` page (mapping configuration) is separate from `/mappings-list`. The sidebar "New Mapping" CTA still points to `/mappings`.

## Risks / Trade-offs

- [Risk: broken internal links] Any hardcoded references to `/archived` or `mappings/[id]` would 404 after rename → Mitigation: grep the frontend for both patterns before completing.
