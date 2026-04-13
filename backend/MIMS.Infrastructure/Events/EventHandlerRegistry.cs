using System.Text.Json;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using MIMS.Application.Events;
using MIMS.Core.Events;

namespace MIMS.Infrastructure.Events;

/// <summary>
/// Maps EventName strings to their concrete handler invocations.
/// Register new entries here when adding new event types.
/// </summary>
public class EventHandlerRegistry(IServiceProvider serviceProvider, ILogger<EventHandlerRegistry> logger)
{
    private readonly Dictionary<string, Func<string, IServiceScope, CancellationToken, Task>> _handlers = new()
    {
        [DataMappingCreatedEventModel.EventNameConst] = async (payload, scope, ct) =>
        {
            var @event = JsonSerializer.Deserialize<DataMappingCreatedEventModel>(payload);
            if (@event is null) return;
            var handler = scope.ServiceProvider.GetRequiredService<IEventHandler<DataMappingCreatedEventModel>>();
            await handler.HandleAsync(@event, ct);
        }
    };

    public async Task DispatchAsync(string eventName, string payload, CancellationToken cancellationToken)
    {
        if (!_handlers.TryGetValue(eventName, out var handler))
        {
            logger.LogWarning("No handler registered for EventName '{EventName}'; discarding.", eventName);
            return;
        }

        using var scope = serviceProvider.CreateScope();
        await handler(payload, scope, cancellationToken);
    }
}
