## 1. Infrastructure Setup

- [x] 1.1 Add Redis service to `docker-compose.yml` (image `redis:7-alpine`, port 6379)
- [x] 1.2 Add NuGet packages to `MIMS.Infrastructure`: `StackExchange.Redis`, `Quartz`, `Quartz.Extensions.Hosting`
- [x] 1.3 Add Redis connection string to `appsettings.json` and `appsettings.Development.json` (`Redis:ConnectionString = "localhost:6379"`)

## 2. Core Domain Event Abstractions

- [x] 2.1 Create `BaseEventModel` abstract record in `MIMS.Core/Events/BaseEventModel.cs` with `string EventName` property
- [x] 2.2 Create `IDomainEventEntities` interface in `MIMS.Core/Events/IDomainEventEntities.cs` with `DomainEvents`, `AddDomainEvent`, and `ClearDomainEvents` members
- [x] 2.3 Create `DataMappingCreatedEventModel` record in `MIMS.Core/Events/DataMappingCreatedEventModel.cs` inheriting `BaseEventModel` with `EventName = "DataMappingCreated"` and `Guid DataMappingId`

## 3. DataMapping Entity Update

- [x] 3.1 Implement `IDomainEventEntities` on the `DataMapping` entity: add private `List<BaseEventModel>`, expose `IReadOnlyList<BaseEventModel> DomainEvents`, implement `AddDomainEvent` and `ClearDomainEvents`
- [x] 3.2 In `CreateDataMappingCommandHandler`, after constructing the new `DataMapping` and before `SaveChangesAsync`, call `dataMapping.AddDomainEvent(new DataMappingCreatedEventModel(dataMapping.Id))`

## 4. Outbox Entity and Migration

- [x] 4.1 Create `Outbox` entity in `MIMS.Core/Entities/Outbox.cs` with properties: `Id` (Guid PK), `EventName` (string), `Payload` (string, max 1000), `Status` (enum `OutboxStatus`: `Sent`, `Processing`, `Failed`, `Success`), `CreatedDate`, `UpdatedDate`, `CreatedBy`, `UpdatedBy`
- [x] 4.2 Create `OutboxStatus` enum in `MIMS.Core/Enums/OutboxStatus.cs`
- [x] 4.3 Configure `Outbox` entity in `AppDbContext`: add `DbSet<Outbox>`, configure `Payload` max length 1000, store `Status` as string
- [x] 4.4 Run EF Core migration: `dotnet ef migrations add AddOutboxTable --project MIMS.Infrastructure --startup-project MIMS.Api`

## 5. EF Core Domain Event Interceptor

- [x] 5.1 Create `DomainEventInterceptor : SaveChangesInterceptor` in `MIMS.Infrastructure/Interceptors/DomainEventInterceptor.cs`
- [x] 5.2 Override `SavingChangesAsync`: iterate `ChangeTracker` entries that implement `IDomainEventEntities`, collect all domain events, create `Outbox` rows (Status = `Sent`, serialize `Payload` via `System.Text.Json`), add to context, then call `ClearDomainEvents()` on each entity
- [x] 5.3 Register `DomainEventInterceptor` in `AppDbContext` options configuration in `Program.cs`

## 6. Redis Infrastructure

- [x] 6.1 Create `RedisConnectionFactory` or register `IConnectionMultiplexer` singleton in `Program.cs` using `ConnectionMultiplexer.Connect(config["Redis:ConnectionString"])`
- [x] 6.2 Register `ISubscriber` (from `IConnectionMultiplexer.GetSubscriber()`) in DI

## 7. Event Handler Interface and Dispatcher

- [x] 7.1 Create `IEventHandler<T>` interface in `MIMS.Application/Events/IEventHandler.cs` with `Task HandleAsync(T @event, CancellationToken ct)` where `T : BaseEventModel`
- [x] 7.2 Create `EventHandlerRegistry` in `MIMS.Infrastructure/Events/EventHandlerRegistry.cs` that maps `EventName` strings to handler types, populated at startup via DI scanning
- [x] 7.3 Create `DataMappingCreatedEventHandler : IEventHandler<DataMappingCreatedEventModel>` in `MIMS.Application/Events/DataMappingCreatedEventHandler.cs`
- [x] 7.4 Implement `DataMappingCreatedEventHandler.HandleAsync`: load `DataMapping` by `DataMappingId`, if `Status == New` update to `Processing` and call `SaveChangesAsync`, else log and return; log warning if not found

## 8. Redis Subscriber

- [x] 8.1 Create `RedisEventSubscriber : BackgroundService` in `MIMS.Infrastructure/Events/RedisEventSubscriber.cs`
- [x] 8.2 In `ExecuteAsync`, subscribe to Redis channel `"domain-events"` and for each message: deserialize JSON to `BaseEventModel` to read `EventName`, resolve `IEventHandler<T>` from a scoped `IServiceProvider`, deserialize payload to the concrete type, call `HandleAsync`
- [x] 8.3 Handle unknown `EventName` (log warning, discard); handle handler exceptions (log error, continue)
- [x] 8.4 Register `RedisEventSubscriber` in `Program.cs` via `services.AddHostedService<RedisEventSubscriber>()`

## 9. Quartz OutboxProcessingJob

- [x] 9.1 Configure Quartz in `Program.cs`: `services.AddQuartz(...)` with `OutboxProcessingJob` scheduled via `CronScheduleBuilder` or `SimpleScheduleBuilder` (every 10 seconds, configurable from `appsettings.json`)
- [x] 9.2 Add `services.AddQuartzHostedService(opt => opt.WaitForJobsToComplete = true)` in `Program.cs`
- [x] 9.3 Create `OutboxProcessingJob : IJob` in `MIMS.Infrastructure/Jobs/OutboxProcessingJob.cs`
- [x] 9.4 Implement `Execute`: query `Outboxes` where `Status = Sent` order by `CreatedDate ASC` take 10, for each publish `Payload` to Redis channel `"domain-events"` via `ISubscriber.PublishAsync`, update `Status` to `Processing`, call `SaveChangesAsync`
- [x] 9.5 Wrap per-record processing in try/catch: on Redis failure rethrow (leave record as `Sent`); log errors

## 10. Frontend: Status-Gated Detail Navigation

- [x] 10.1 In the mappings list page, identify where data mapping rows render the detail link/button
- [x] 10.2 Add logic so the detail link is only enabled (clickable/navigable) when `status === 'Verifying' || status === 'Verifying'` — disable or show tooltip for `New`, `Processing`, `Failed`
- [x] 10.3 Update the `DataMappingStatus` type/enum in the frontend to include `Processing` status if not already present

## 11. Verification

- [ ] 11.1 Run `docker compose up -d` and confirm Redis starts on port 6379
- [ ] 11.2 Apply DB migration (`dotnet ef database update ...`) and confirm `Outboxes` table exists in TimescaleDB
- [ ] 11.3 Create a data mapping via `POST /api/data-mapping` and confirm an `Outbox` row with `Status = Sent` appears
- [ ] 11.4 Wait for Quartz job to fire; confirm Outbox row moves to `Status = Processing` and Redis receives the message
- [ ] 11.5 Confirm `DataMapping.Status` transitions from `New` to `Processing` after the handler runs
- [ ] 11.6 Confirm mappings list disables detail navigation for `New`/`Processing` status items
