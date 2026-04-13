## Context

Two pages need layout fixes:

1. **Upload page** (`/data-sources/upload`): The upload form (name input, drag-and-drop zone, action buttons, feedback messages) and the Recent Data Sources table are stacked vertically in a single column. On typical widescreen displays this leaves large empty margins and forces scrolling to see the table.

2. **Mapping List page** (`/mappings-list`): The table header row uses `py-3` padding, producing a noticeably shorter header compared to the Data Sources list which uses `py-4`. The container also uses `shadow-sm` with an explicit border, while the Data Sources list uses a larger box shadow with no border. These differences create visual inconsistency across the two list screens.

Both changes are purely front-end: no API, backend, or data model changes are involved.

## Goals / Non-Goals

**Goals:**
- Restructure the Upload page into a two-column flex layout: left column = upload form, right column = Recent Data Sources table.
- Align the Mapping List table header padding and container shadow/border with the Data Sources list.
- Maintain all existing behaviour, state management, and responsive considerations.

**Non-Goals:**
- Responsive breakpoints for very small viewports (keep existing behaviour).
- Any changes to the Data Sources list page itself.
- Any API or backend changes.

## Decisions

### Two-column layout for Upload page

**Decision**: Use a CSS flex row (`flex gap-8`) at the top level inside the `max-w-6xl` container, with the left column holding the form (fixed width or `w-2/5`) and the right column holding the Recent Data Sources panel (flex-grow).

**Rationale**: The existing layout is a simple vertical stack inside a `space-y-6` wrapper. Switching to flex row is the smallest structural change. The form is narrower than the table by nature (one input + drop zone), so a roughly 40/60 split gives the table adequate space to show all columns without horizontal scroll.

**Alternative considered**: CSS grid with `grid-cols-[2fr_3fr]`. Functionally identical; flex was chosen for simplicity given no complex alignment needs.

### Matching Mapping List grid to Data Sources list

**Decision**: Change the Mapping List table header cells from `py-3` to `py-4`, and update the container from `shadow-sm` + `border: "1px solid #e1e9ee"` to `boxShadow: "0 32px 64px -15px rgba(42,52,57,0.06)"` with no separate border.

**Rationale**: The Data Sources list is the established reference style in this app. Copying its exact values produces consistent appearance with no design ambiguity.

## Risks / Trade-offs

- [Upload form feels cramped at narrower windows] → The left column contains a large drop zone (minHeight 280px) which may feel tight at ~1024px viewport. Mitigation: keep `min-w-0` on columns and allow the drop zone to shrink gracefully.
- [Styling drift] → Copying exact Tailwind classes and inline style values rather than extracting shared constants keeps the fix surgical but creates two places to update if the design language changes later. Acceptable for this scope.

## Migration Plan

1. Edit `frontend/src/app/data-sources/upload/page.tsx`: replace `<div className="space-y-6">` wrapper with a flex-row container; split form section and recent-sources section into left/right children.
2. Edit `frontend/src/app/mappings-list/DataMappingListClient.tsx`: update `<th>` padding classes and table container styling.
3. Visual QA on both pages.
4. No migrations, no deployments beyond normal front-end build.
