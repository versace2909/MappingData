## Why

`DataSource` and `DataSourceDetail` entities were implemented without inheriting from `BaseEntity`, duplicating audit fields (`CreatedBy`, `UpdatedBy`, `CreatedDate`, `UpdatedDate`) directly on each entity class with inconsistent types and access modifiers. This violates the intended domain architecture and makes future entity additions error-prone.

## What Changes

- **BREAKING**: Change entity `Id` from `Guid` to `int` with auto-increment — `BaseEntity` already declares `int Id`, entities were wrong to use `Guid`
- Rename `BaseEntity.CreatedAt` → `CreatedDate` and `UpdatedAt` → `UpdatedDate` to match existing DB column names and avoid a destructive column rename migration
- Remove duplicate audit properties (`Id`, `CreatedBy`, `UpdatedBy`, `CreatedDate`, `UpdatedDate`) from `DataSource` and `DataSourceDetail`
- Make both entities inherit from `BaseEntity`
- Update EF Core configurations to remove redundant audit property mappings (now inherited)
- Update `UploadDataSourceCommandHandler` to use `BaseEntity.SetCreatedBy()` method
- Drop and recreate migration to reflect the clean model (since DB was not yet in production)

## Capabilities

### New Capabilities
- `entity-base-inheritance`: All domain entities properly inherit from `BaseEntity`, centralizing audit fields and Id type

### Modified Capabilities
- None

## Impact

- `MIMS.Core/Entities/Common/BaseEntity.cs` — rename audit properties; `Id` stays `int` (already correct)
- `MIMS.Core/Entities/DataSource.cs` — remove duplicate properties, add inheritance
- `MIMS.Core/Entities/DataSourceDetail.cs` — remove duplicate properties, add inheritance
- `MIMS.Infrastructure/Persistence/Configurations/DataSourceConfiguration.cs` — remove now-inherited property mappings
- `MIMS.Infrastructure/Persistence/Configurations/DataSourceDetailConfiguration.cs` — remove now-inherited property mappings
- `MIMS.Application/DataSources/Commands/UploadDataSource/UploadDataSourceCommandHandler.cs` — use `SetCreatedBy()` instead of direct property assignment
- `MIMS.Infrastructure/Migrations/` — delete old migration, add new migration via `dotnet ef migrations add`
