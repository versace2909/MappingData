## Context

The project follows Clean Architecture with a `BaseEntity` in `MIMS.Core` intended to centralize audit fields (`Id`, `CreatedBy`, `UpdatedBy`, audit timestamps) for all domain entities. `DataSource` and `DataSourceDetail` were implemented without inheriting `BaseEntity`, duplicating these fields directly with divergent naming (`CreatedDate`/`UpdatedDate` vs `BaseEntity`'s `CreatedAt`/`UpdatedAt`) and using `Guid Id` while `BaseEntity` correctly declares `int Id`. The intent is `int` with auto-increment. There is one existing EF migration that must be replaced (it currently uses `uuid`; the new migration will use `integer`).

## Goals / Non-Goals

**Goals:**
- Rename `BaseEntity` audit timestamps to `CreatedDate`/`UpdatedDate` to align with the DB column names (`BaseEntity.Id` stays `int` — already correct)
- Make `DataSource` and `DataSourceDetail` inherit `BaseEntity`
- Remove duplicated audit properties from entity classes
- Update EF configurations to no longer map inherited properties (or add a shared base config)
- Update command handler to use `BaseEntity.SetCreatedBy()` pattern
- Delete old migration and generate a new clean migration

**Non-Goals:**
- Changing DB column names or table structure
- Adding new entities beyond what already exists
- Implementing generic `BaseEntity<TKey>` (not needed yet)

## Decisions

### 1. `BaseEntity.Id` stays `int` with auto-increment
**Decision**: Use `int` (identity/serial).  
**Rationale**: `BaseEntity` was always designed with `int Id`. The entities were wrongly implemented using `Guid`. Since the DB is pre-production, we drop and recreate the migration, changing the `id` column from `uuid` to `integer` with `GENERATED ALWAYS AS IDENTITY` (PostgreSQL) / auto-increment. This is the correct long-term key strategy for this project.  
**Alternative considered**: Keep `Guid` to avoid changing the migration — rejected because it perpetuates the wrong pattern from `BaseEntity`.  
**EF configuration**: Remove explicit `HasColumnName("id")` or let convention handle it; configure `ValueGeneratedOnAdd()` via EF convention for `int` PKs (default behavior).

### 2. Rename `BaseEntity.CreatedAt` → `CreatedDate`, `UpdatedAt` → `UpdatedDate`
**Decision**: Rename in `BaseEntity` to match existing entity naming.  
**Rationale**: Existing DB columns are `created_date` / `updated_date`. The EF configurations and command handler already use `CreatedDate`/`UpdatedDate`. Renaming in `BaseEntity` avoids a destructive column rename migration and zero changes to existing EF config mappings for those properties.  
**Alternative considered**: Keep `CreatedAt`/`UpdatedAt` and rename DB columns via migration — more churn with no benefit since the DB is pre-production.

### 3. Audit property access modifiers
**Decision**: Keep `protected set` on `BaseEntity` audit properties, with `SetCreatedBy()` and `SetUpdatedAt()` methods as the mutation points.  
**Rationale**: Encapsulates audit mutation. Command handlers must use the provided methods rather than setting properties directly.

### 4. EF Configuration for inherited properties
**Decision**: Keep per-entity `IEntityTypeConfiguration` classes and explicitly map inherited `BaseEntity` properties there (instead of a shared base configuration).  
**Rationale**: Per-entity configs are already in place. Adding a shared `BaseEntityConfiguration<T>` would be over-engineering for two entities. The inherited properties (`Id`, `CreatedBy`, `UpdatedBy`, `CreatedDate`, `UpdatedDate`) keep the same column names so their existing config entries simply stay.

### 5. Migration strategy
**Decision**: Delete the existing migration (`AddDataSourceTables`) and generate a fresh one.  
**Rationale**: The database is pre-production with no live data. A clean migration is simpler than an incremental one that renames C# property types with no actual DB schema change.

## Risks / Trade-offs

- **`protected set` on audit fields breaks object initializer syntax** → Mitigation: Command handler must use constructor or `SetCreatedBy()` / direct assignment through a public setter won't compile. The `Id` and domain-specific fields still need public setters (or the entity needs a constructor). We keep `public set` on `Id` for EF hydration, and use `SetCreatedBy()` for `CreatedBy`.
- **`CreatedDate` default in `BaseEntity` vs explicit assignment** → The current `BaseEntity.CreatedAt` defaults to `DateTime.UtcNow` at construction time. After rename to `CreatedDate`, the command handler's explicit `CreatedDate = DateTime.UtcNow` line becomes redundant and should be removed.
- **Deleting the migration** → Only safe because the DB is local/pre-production. Must be documented in tasks.

## Migration Plan

1. Update `BaseEntity` (rename props, change Id type)
2. Update entity classes (add inheritance, remove duplicated fields)
3. Update EF configurations (remove now-redundant audit property mappings already inherited)
4. Update command handler (remove explicit audit field assignments, use `SetCreatedBy()`)
5. Delete `MIMS.Infrastructure/Migrations/` folder contents
6. Run `dotnet ef migrations add InitialCreate --project MIMS.Infrastructure --startup-project MIMS.Api`
7. Verify migration output matches expected schema

## Open Questions

- None — all decisions are made above.
