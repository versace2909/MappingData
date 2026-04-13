## Context

The project is a .NET 8 Clean Architecture backend (MIMS.Core / MIMS.Application / MIMS.Infrastructure / MIMS.Api) using EF Core + MediatR + CQRS, with a Next.js 14 frontend calling `apiFetch` via a shared `src/lib/api.ts` helper.

Currently the `/mappings` page uses static mock data (`mappingSources`, `mappingTargets`) and two plain `<select>` dropdowns. There is no `DataMapping` entity, no mapping API, and no mapping list page.

## Goals / Non-Goals

**Goals:**
- Add `DataMapping` table and EF Core entity following existing patterns (BaseEntity, Configurations, Migrations)
- Expose `GET /api/data-source/list-dropdown` and `POST /api/data-mapping` REST endpoints via new MediatR handlers
- Replace mock-data dropdowns on `/mappings` with live filterable dropdowns backed by the dropdown API; add Mapping Name input; wire Run Auto Map to POST API
- Add `/mappings/{id}` page: paginated grid of all data mappings, filterable by MappingName

**Non-Goals:**
- Field-level mapping logic (deferred)
- Authentication / authorization
- Soft-delete or archiving of mappings
- Real-time status updates (polling, websockets)

## Decisions

### D1 — Follow existing CQRS/MediatR pattern
All new application logic lives as Commands/Queries under `MIMS.Application/DataMappings/`. Rationale: consistent with `DataSources` feature; no new patterns to learn.

### D2 — New controller `DataMappingController` at `/api/data-mapping`
Separate controller keeps routing clean and avoids coupling the DataSources controller with mapping concerns. The dropdown endpoint (`/api/data-source/list-dropdown`) lives in `DataSourcesController` since it queries data sources.

### D3 — `DataMappingStatus` as C# enum stored as string in DB
Storing as string ("New", "Mapping", "Verified", "Verifying") makes the DB human-readable and avoids int-enum confusion on new members. Uses EF `HasConversion<string>()`.

### D4 — Frontend validation: prevent same-source selection client-side
When the user selects a Target equal to the selected Source (or vice versa), show an inline error message and do not enable the Run Auto Map button. No server-side duplicate check needed at this stage.

### D5 — Filterable dropdown as combobox pattern
Use a `<input type="text">` + filtered `<datalist>` or a simple controlled `<select>` with a search `<input>` above it. Keeps the UI consistent with the existing design without adding an external component library.

### D6 — Paginated list endpoint for `/mappings/{id}`
`GET /api/data-mapping?page=1&pageSize=10&mappingName=` returns a paged result following the same `{ items, totalCount, page, pageSize }` shape already used by `GetDataSourceDetails`. Frontend reuses the same pagination pattern from the data-source detail page.

## Risks / Trade-offs

- [Risk] EF Core migration must be applied before the backend starts → Mitigation: run `dotnet ef database update` as part of the startup/dev instructions; document in README.
- [Risk] Frontend combobox for filtering may feel custom/inconsistent → Mitigation: use a minimal pattern (text input + filtered list) that matches the existing white-card design style.
- [Risk] `POST /api/data-mapping` with non-existent SourceDataId/TargetDataId → Mitigation: validate FK existence in the command handler; return 400 with a descriptive error.

## Migration Plan

1. Add `DataMapping` entity and EF Configuration in `MIMS.Core` / `MIMS.Infrastructure`
2. Run `dotnet ef migrations add AddDataMapping` and `dotnet ef database update`
3. Add Application layer: `GetDataSourceDropdownQuery`, `CreateDataMappingCommand`, `GetDataMappingListQuery`
4. Add/extend API controllers
5. Update frontend `/mappings` page; add `/mappings/[id]` page
6. Verify BE builds (`dotnet build`) and FE builds (`npm run build`), smoke-test end-to-end
