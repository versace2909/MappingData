## 1. Upload Page Left-Right Layout

- [x] 1.1 In `frontend/src/app/data-sources/upload/page.tsx`, replace the `<div className="space-y-6">` wrapper (line 179) with a `<div className="flex gap-8 items-start">` flex-row container.
- [x] 1.2 Wrap the `<form>` block (name input, drop zone, action buttons) in a `<div className="w-2/5 min-w-0 flex flex-col gap-4">` left-column div.
- [x] 1.3 Wrap the success/error feedback messages and the Recent Data Sources table in a `<div className="flex-1 min-w-0 flex flex-col gap-4">` right-column div.

## 2. Mapping List Grid Consistency

- [x] 2.1 In `frontend/src/app/mappings-list/DataMappingListClient.tsx`, update all `<th>` elements in the `<thead>` from `py-3` to `py-4` to match the Data Sources list header row height.
- [x] 2.2 Update the table container `<div>` (line 112) to replace `className="bg-white rounded-xl overflow-hidden shadow-sm"` with `className="bg-white rounded-xl overflow-hidden"` and `style={{ border: "1px solid #e1e9ee" }}` with `style={{ boxShadow: "0 32px 64px -15px rgba(42,52,57,0.06)" }}` to match the Data Sources list container styling.
