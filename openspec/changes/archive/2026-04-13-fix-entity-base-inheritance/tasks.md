## 1. Update BaseEntity

- [x] 1.1 Rename `BaseEntity.CreatedAt` → `CreatedDate` and update the default initializer (`= DateTime.UtcNow`) accordingly
- [x] 1.2 Rename `BaseEntity.UpdatedAt` → `UpdatedDate` and update `SetUpdatedAt()` method body to set `UpdatedDate`
- [x] 1.3 Rename `SetUpdatedAt()` → `SetUpdatedDate()` for consistency with the renamed property

## 2. Update Domain Entities

- [x] 2.1 Make `DataSource` inherit `: BaseEntity` and remove `Id` (was `Guid`, now inherited as `int`), `CreatedBy`, `UpdatedBy`, `CreatedDate`, `UpdatedDate` properties
- [x] 2.2 Make `DataSourceDetail` inherit `: BaseEntity` and remove `Id` (was `Guid`, now inherited as `int`), `CreatedBy`, `UpdatedBy`, `CreatedDate`, `UpdatedDate` properties
- [x] 2.3 Remove `DataSourceId` foreign key from `DataSourceDetail` (was `Guid`); it stays as `int` now matching `DataSource.Id` type — update type to `int`

## 3. Update EF Core Configurations

- [x] 3.1 In `DataSourceConfiguration`, update the `Id` mapping to use `int` identity (EF convention handles this for `int` PKs; remove any explicit `HasColumnType("uuid")` or `ValueGeneratedNever()`); keep `HasColumnName("id")`; remove duplicate `CreatedBy`, `UpdatedBy`, `CreatedDate`, `UpdatedDate` mappings (now inherited)
- [x] 3.2 In `DataSourceDetailConfiguration`, same as above for `Id`; update `DataSourceId` FK property type to `int`; remove duplicate audit property mappings

## 4. Update Command Handler

- [x] 4.1 In `UploadDataSourceCommandHandler`, remove `Id = dataSourceId` (no longer `Guid`; Id is DB-generated), `CreatedBy = "Admin"`, and `CreatedDate = DateTime.UtcNow` from the `DataSource` object initializer; call `dataSource.SetCreatedBy("Admin")` after construction
- [x] 4.2 Remove `Id = Guid.NewGuid()`, `DataSourceId = dataSourceId`, `CreatedBy = "Admin"`, and `CreatedDate = DateTime.UtcNow` from `DataSourceDetail` object initializer; update `DataSourceId` reference — FK is now `int` (set after `DataSource` is saved and has a DB-generated `Id`)
- [x] 4.3 Adjust `UploadDataSourceResult` return value — `dataSourceId` was a pre-generated `Guid`; now use `dataSource.Id` (available after `SaveChangesAsync`)

## 5. Rebuild EF Migration

- [x] 5.1 Delete all files in `MIMS.Infrastructure/Migrations/` (old migration and snapshot)
- [x] 5.2 Run `dotnet ef migrations add InitialCreate --project backend/MIMS.Infrastructure --startup-project backend/MIMS.Api` from the repo root
- [x] 5.3 Verify the generated migration creates `data_source` and `data_source_detail` with `id integer` (auto-increment/serial), `created_by`, `updated_by`, `created_date`, `updated_date`, and all entity-specific columns
- [x] 5.4 Confirm `data_source_detail.data_source_id` FK column is `integer` (matching the new `DataSource.Id` type)

## 6. Verify Build

- [x] 6.1 Run `dotnet build` from the repo root and confirm zero errors
- [x] 6.2 Confirm no remaining direct references to old property names (`CreatedDate` on entities, `CreatedAt` on BaseEntity) exist via a quick search
