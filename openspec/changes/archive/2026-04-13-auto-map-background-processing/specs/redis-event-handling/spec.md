## ADDED Requirements

### Requirement: Redis pub/sub infrastructure is configured
The system SHALL connect to Redis using `StackExchange.Redis` with the connection string read from `appsettings.json` (`Redis:ConnectionString`). The Redis connection SHALL be registered as a singleton in the DI container.

#### Scenario: Application starts with Redis available
- **WHEN** the application starts and Redis is reachable at the configured connection string
- **THEN** the connection SHALL be established without error and the subscriber SHALL begin listening on channel `"domain-events"`

#### Scenario: Application starts with Redis unavailable
- **WHEN** the application starts and Redis is unreachable
- **THEN** the application SHALL still start (non-fatal) and the Quartz job will fail gracefully until Redis becomes available

### Requirement: Base Redis subscriber dispatches to typed handlers
The system SHALL have a hosted Redis subscriber (`RedisEventSubscriber`) that subscribes to the `"domain-events"` channel. For each received message it SHALL:
1. Deserialize the JSON payload to `BaseEventModel` to read `EventName`
2. Resolve the matching `IEventHandler<T>` from DI by `EventName`
3. Deserialize the payload to the concrete event type `T`
4. Invoke `HandleAsync(T @event, CancellationToken ct)` in a scoped DI scope

#### Scenario: Known event received
- **WHEN** a message with a known `EventName` (e.g., `"DataMappingCreated"`) is received on the channel
- **THEN** the corresponding handler (`DataMappingCreatedEventHandler`) SHALL be resolved and `HandleAsync` SHALL be called with the deserialized event

#### Scenario: Unknown event received
- **WHEN** a message with an unrecognized `EventName` is received
- **THEN** the subscriber SHALL log a warning and discard the message without throwing

#### Scenario: Handler throws an exception
- **WHEN** an `IEventHandler<T>.HandleAsync` call throws
- **THEN** the subscriber SHALL log the exception and continue processing subsequent messages (no crash)

### Requirement: IEventHandler contract
The system SHALL define a generic interface `IEventHandler<T> where T : BaseEventModel`. Each concrete handler SHALL be registered in DI and discoverable by `EventName`. The system SHALL support registering multiple independent handlers without modifying shared infrastructure code.

#### Scenario: New event type added
- **WHEN** a developer adds a new `BaseEventModel` subclass and a corresponding `IEventHandler<T>` registered in DI
- **THEN** the Redis subscriber SHALL automatically dispatch messages of that `EventName` to the new handler without any changes to `RedisEventSubscriber`

### Requirement: DataMappingCreatedEventHandler sets status to Processing
`DataMappingCreatedEventHandler` SHALL handle `DataMappingCreatedEventModel` events. On receipt it SHALL load the `DataMapping` by `DataMappingId`, set its `Status` to `Processing` (only if current status is `New`), and save the change.

#### Scenario: DataMapping found with status New
- **WHEN** `DataMappingCreatedEventHandler.HandleAsync` is called with a valid `DataMappingId` and the mapping has `Status = New`
- **THEN** the mapping's status SHALL be updated to `Processing` and persisted

#### Scenario: DataMapping already in Processing or later status
- **WHEN** `DataMappingCreatedEventHandler.HandleAsync` is called but the mapping's status is not `New`
- **THEN** no update SHALL occur (idempotent behavior)

#### Scenario: DataMapping not found
- **WHEN** `DataMappingCreatedEventHandler.HandleAsync` is called with a `DataMappingId` that does not exist
- **THEN** the handler SHALL log a warning and return without throwing
