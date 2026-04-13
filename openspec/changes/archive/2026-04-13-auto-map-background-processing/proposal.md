## Why

The data mapping feature needs an automated matching process to suggest term mappings between source and target datasets. To support this without blocking user interactions, we need a reliable background processing pipeline that uses an Outbox pattern for durability and Redis pub/sub for event-driven dispatch.

## What Changes

- Introduce `IDomainEventEntities` interface and `BaseEventModel` base class to support domain event publishing from entities
- Add domain event support to `DataMapping` entity via `DataMappingCreatedEventModel`
- Add `Outbox` entity and `Outboxes` table to persist domain events before dispatch
- Add EF Core SaveChanges interceptor that captures domain events and writes Outbox records
- Add Redis pub/sub infrastructure for publishing and subscribing to domain events
- Set up Quartz.NET background job (`OutboxProcessingJob`) to poll the Outbox and publish pending events to Redis
- Implement a base Redis subscriber with typed handler dispatch (`DataMappingCreatedEventHandler`)
- Update `DataMapping` status to `Processing` when the handler receives the created event
- Allow users to open data mapping detail page when status is `Verifying` or `Verified`

## Capabilities

### New Capabilities

- `outbox-processing`: Outbox table, EF Core interceptor, Quartz job that polls and publishes pending Outbox records to Redis pub/sub
- `redis-event-handling`: Redis pub/sub infrastructure, base subscriber, typed domain event handlers dispatched by event name
- `auto-map-trigger`: Domain event raised on DataMapping creation that triggers the auto-map background workflow

### Modified Capabilities

- `data-mapping-create`: DataMapping entity now raises a domain event on creation; status transitions to `Processing` when the handler picks it up

## Impact

- **Backend packages**: Add `StackExchange.Redis`, `Quartz`, `Quartz.Extensions.Hosting`
- **Database**: New `Outboxes` table (EF Core migration required)
- **Infrastructure**: Redis required in dev (add to `docker-compose.yml`)
- **DataMapping entity**: Implements `IDomainEventEntities`, raises `DataMappingCreatedEventModel` on creation
- **API**: No new endpoints; status-gated detail page access (`Verifying` or `Verified` only)
- **Frontend**: Guard on data mapping detail navigation — only allow when status is `Verifying` or `Verified`
