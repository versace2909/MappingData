## ADDED Requirements

### Requirement: Outbox table persists domain events
The system SHALL have an `Outboxes` database table with columns: `Id` (UUID PK), `EventName` (varchar, not null), `Payload` (varchar max length 1000, not null, JSON-serialized `BaseEventModel`), `Status` (enum: `Sent`, `Processing`, `Failed`, `Success`), `CreatedDate`, `UpdatedDate`, `CreatedBy`, `UpdatedBy`. Initial status on insert SHALL be `Sent`.

#### Scenario: Outbox row created on domain event
- **WHEN** an entity implementing `IDomainEventEntities` has pending domain events and `SaveChangesAsync` is called
- **THEN** the interceptor SHALL insert one `Outbox` row per event with `Status = Sent` in the same database transaction

#### Scenario: No domain events — no Outbox rows
- **WHEN** `SaveChangesAsync` is called and no tracked entity has domain events
- **THEN** no `Outbox` row SHALL be inserted

### Requirement: EF Core interceptor harvests domain events
The system SHALL register a `SaveChangesInterceptor` (`DomainEventInterceptor`) that, before the final flush, iterates all `ChangeTracker` entries implementing `IDomainEventEntities`, drains their `DomainEvents` list, JSON-serializes each event to `Payload`, and adds corresponding `Outbox` entities to the context. After draining, the entity's domain event list SHALL be cleared.

#### Scenario: Interceptor drains events exactly once
- **WHEN** `SaveChangesAsync` completes successfully
- **THEN** the entity's `DomainEvents` list SHALL be empty and the corresponding `Outbox` rows SHALL exist in the database

### Requirement: Quartz OutboxProcessingJob polls and publishes
The system SHALL run a Quartz.NET job (`OutboxProcessingJob`) on a configurable interval (default 10 seconds). Each execution SHALL fetch up to 10 `Outbox` records with `Status = Sent` ordered by `CreatedDate ASC`, publish each record's `Payload` to the Redis pub/sub channel `"domain-events"`, and update the record's `Status` to `Processing`.

#### Scenario: Pending Sent records exist
- **WHEN** `OutboxProcessingJob` runs and there are records with `Status = Sent`
- **THEN** up to 10 SHALL be published to Redis and their status updated to `Processing`

#### Scenario: No Sent records
- **WHEN** `OutboxProcessingJob` runs and no `Outbox` records have `Status = Sent`
- **THEN** the job SHALL complete without error and no Redis publish SHALL occur

#### Scenario: Redis unavailable during job execution
- **WHEN** `OutboxProcessingJob` attempts to publish but Redis is unreachable
- **THEN** the job SHALL throw an exception, the `Outbox` records SHALL remain in `Status = Sent`, and the job SHALL retry on the next scheduled interval
