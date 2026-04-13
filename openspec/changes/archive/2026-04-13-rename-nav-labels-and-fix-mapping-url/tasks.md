## 1. Update Sidebar Navigation Labels and Links

- [x] 1.1 In `frontend/src/components/layout/SideNavBar.tsx`, rename the label "Active Projects" to "DataSource List"
- [x] 1.2 In `frontend/src/components/layout/SideNavBar.tsx`, rename the label "Archived" to "Mapping List"
- [x] 1.3 In `frontend/src/components/layout/SideNavBar.tsx`, update the "Mapping List" link href from `/archived` to `/mappings-list`
- [x] 1.4 Update the `isActive` / `pathname.startsWith` logic in `SideNavBar.tsx` if needed to highlight "Mapping List" for `/mappings-list`

## 2. Rename Mappings Detail Page Directory

- [x] 2.1 Move `frontend/src/app/mappings/[id]/` to `frontend/src/app/mappings-list/`
- [x] 2.2 Search the frontend for any hardcoded references to `mappings/[id]` or `/archived` and update them to `/mappings-list`
- [x] 2.3 Verify the app builds without errors (`npm run build` in `frontend/`)
