using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using MIMS.Core.Entities;
using MIMS.Infrastructure.Persistence;
using Quartz;
using StackExchange.Redis;

namespace MIMS.Infrastructure.Jobs;

[DisallowConcurrentExecution]
public class OutboxProcessingJob(
    IDbContextFactory<AppDbContext> dbContextFactory,
    ISubscriber subscriber,
    ILogger<OutboxProcessingJob> logger)
    : IJob
{
    private const string Channel = "domain-events";
    private const int BatchSize = 10;

    public async Task Execute(IJobExecutionContext context)
    {
        await using var dbContext = await dbContextFactory.CreateDbContextAsync(context.CancellationToken);

        var pending = await dbContext.Outboxes
            .Where(o => o.Status == OutboxStatus.Sent)
            .OrderBy(o => o.CreatedDate)
            .Take(BatchSize)
            .ToListAsync(context.CancellationToken);

        if (pending.Count == 0)
            return;

        logger.LogInformation("OutboxProcessingJob: processing {Count} records.", pending.Count);

        foreach (var outbox in pending)
        {
            try
            {
                await subscriber.PublishAsync(RedisChannel.Literal(Channel), outbox.Payload);

                outbox.Status = OutboxStatus.Processing;
                outbox.UpdatedDate = DateTime.UtcNow;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to publish Outbox record {Id} to Redis.", outbox.Id);
                throw; // Leave records as Sent; job will retry on next interval
            }
        }

        await dbContext.SaveChangesAsync(context.CancellationToken);
    }
}
