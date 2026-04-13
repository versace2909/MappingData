using System.Text.Json;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using MIMS.Core.Events;
using StackExchange.Redis;

namespace MIMS.Infrastructure.Events;

public class RedisEventSubscriber(
    ISubscriber subscriber,
    EventHandlerRegistry registry,
    ILogger<RedisEventSubscriber> logger)
    : BackgroundService
{
    private const string Channel = "domain-events";

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        await subscriber.SubscribeAsync(RedisChannel.Literal(Channel), async (_, message) =>
        {
            if (message.IsNullOrEmpty)
                return;

            string? eventName = null;

            try
            {
                var doc = JsonDocument.Parse(message.ToString());
                if (!doc.RootElement.TryGetProperty("EventName", out var prop))
                {
                    logger.LogWarning("Redis message missing 'EventName'; discarding.");
                    return;
                }

                eventName = prop.GetString();
                if (string.IsNullOrEmpty(eventName))
                {
                    logger.LogWarning("Redis message has empty 'EventName'; discarding.");
                    return;
                }

                await registry.DispatchAsync(eventName, message.ToString(), stoppingToken);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error processing Redis message for event '{EventName}'.", eventName ?? "unknown");
            }
        });

        // Keep alive until stopped
        await Task.Delay(Timeout.Infinite, stoppingToken).ContinueWith(_ => { }, CancellationToken.None);
    }
}
