## Context

The MIMS backend is a Clean Architecture ASP.NET Core application. Currently when a `DataMapping` is created its status stays `New` forever — there is no background processing. We need to wire up a reliable event pipeline so that the auto-map job can be triggered asynchronously after a mapping is saved without losing events if the process crashes.

The chosen pattern is the **Transactional Outbox**: domain events are written to an `Outboxes` DB table in the same transaction as the entity save, then a Quartz.NET job polls the table and publishes the events to Redis pub/sub. Subscribers handle each event type by dispatching to a typed handler.

Infrastructure additions: **StackExchange.Redis** (pub/sub), **Quartz.NET** (background scheduler), a new `Outboxes` table via EF Core migration.

## Goals / Non-Goals

**Goals:**
- Domain events survive process crashes (Outbox pattern, same DB transaction)
- Exactly-one-publisher guarantee per Outbox record (status machine: `Sent → Processing`)
- Extensible handler registry: adding a new event type means adding one `BaseEventModel` subclass and one handler — no changes to infrastructure
- DataMapping status advances to `Processing` when the handler receives the event
- Redis is available in local dev via `docker-compose.yml`

**Non-Goals:**
- Exactly-once delivery to Redis (best-effort; duplicate-safe handler logic is left for the auto-map implementation phase)
- Retry / dead-letter handling for failed Outbox records (out of scope now; `Status = Failed` is reserved)
- The actual auto-map matching algorithm (handler body is a stub; status → `Processing` only)
- Horizontal scaling / leader election for the Quartz job (single instance only)

## Decisions

### D1 — Transactional Outbox over direct Redis publish

**Decision**: Write domain events to `Outboxes` in the same EF Core transaction; a Quartz job polls and publishes.

**Why over direct publish-on-save**: Direct publish loses events if the process crashes between the DB commit and the Redis send. The Outbox writes both atomically.

**Alternatives considered**:
- MassTransit Outbox — too heavy for a single-service, simple event; adds a large dependency.
- DB triggers — cross-cutting concern, not portable across migrations.

### D2 — EF Core `SaveChangesInterceptor` for event harvesting

**Decision**: `DomainEventInterceptor : SaveChangesInterceptor` iterates `ChangeTracker` entries that implement `IDomainEventEntities`, drains their `DomainEvents` list, and inserts `Outbox` rows before flushing.

**Why**: Keeps domain logic (raising events) out of handlers/controllers; consistent with DDD conventions. The interceptor is registered globally in `AppDbContext`.

### D3 — Generic `IDomainEventEntities` / `BaseEventModel` contract

**Decision**:
```csharp
// Core layer
public interface IDomainEventEntities {
    IReadOnlyList<BaseEventModel> DomainEvents { get; }
    void AddDomainEvent(BaseEventModel @event);
    void ClearDomainEvents();
}

public abstract record BaseEventModel(string EventName);
public record DataMappingCreatedEventModel(Guid DataMappingId) : BaseEventModel("DataMappingCreated");
```

**Why**: Strong-typed events with a shared base allow the Outbox interceptor and Redis dispatcher to work generically without knowing concrete event types at compile time.

### D4 — Redis pub/sub channel naming

**Decision**: Single channel `"domain-events"`. The `EventName` field in the JSON payload routes to the correct handler.

**Why over per-event channels**: Simpler subscriber setup for now; routing by `EventName` is sufficient. Can split channels later without changing the Outbox schema.

### D5 — Quartz.NET for Outbox polling

**Decision**: `OutboxProcessingJob` runs every **10 seconds** (configurable), fetches up to 10 `Sent` records ordered by `CreatedDate ASC`, publishes each to Redis, then updates status to `Processing`.

**Why Quartz over `BackgroundService`**: Built-in scheduling DSL, misfire handling, and future extensibility (other jobs). `IHostedService`-based Quartz is registered via `AddQuartz` / `AddQuartzHostedService`.

### D6 — Handler dispatch via dictionary keyed on EventName

**Decision**: On app startup, all `IEventHandler<T>` implementations are registered. The Redis subscriber deserializes the payload to `BaseEventModel`, reads `EventName`, looks up the handler, and invokes it.

```csharp
public interface IEventHandler<T> where T : BaseEventModel {
    Task HandleAsync(T @event, CancellationToken ct);
}
```

The dispatcher resolves handlers from DI using `IServiceProvider` (scoped per message).

## Risks / Trade-offs

- **Duplicate publish on Quartz misfire** → Handler must be idempotent. Current stub (set status = `Processing`) is safe via a conditional update (`WHERE Status = 'New'`).
- **Redis unavailable** → Quartz job will throw; records stay `Sent`. Job will retry on next poll. No data loss.
- **Outbox table growth** → Records are never deleted in this iteration. A cleanup job can be added later; not blocking now.
- **Single Quartz instance** → If two instances run (scale-out), both may pick up the same records. Acceptable for current single-instance deploy; optimistic locking or `SELECT FOR UPDATE SKIP LOCKED` needed at scale.

## Migration Plan

1. Add NuGet packages: `StackExchange.Redis`, `Quartz`, `Quartz.Extensions.Hosting`
2. Add Redis service to `docker-compose.yml` (port 6379)
3. Add `Outbox` entity + `AppDbContext` configuration
4. Run EF Core migration (`dotnet ef migrations add AddOutboxTable`)
5. Register interceptor, Redis, Quartz, and handlers in `Program.cs`
6. Smoke-test: create a mapping → confirm Outbox row appears → confirm Quartz publishes → confirm handler sets status = `Processing`

## Open Questions

- Should `OutboxProcessingJob` interval be configurable via `appsettings.json`? (Recommended yes — default 10 s)
- Is a Redis password required in the dev `docker-compose.yml`? (Assume no for now.)
