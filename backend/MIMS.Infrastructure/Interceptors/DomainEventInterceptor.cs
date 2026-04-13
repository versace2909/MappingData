using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using MIMS.Core.Entities;
using MIMS.Core.Events;

namespace MIMS.Infrastructure.Interceptors;

public class DomainEventInterceptor : SaveChangesInterceptor
{
    public override async ValueTask<InterceptionResult<int>> SavingChangesAsync(
        DbContextEventData eventData,
        InterceptionResult<int> result,
        CancellationToken cancellationToken = default)
    {
        if (eventData.Context is not null)
            await HarvestDomainEvents(eventData.Context);

        return await base.SavingChangesAsync(eventData, result, cancellationToken);
    }

    private static Task HarvestDomainEvents(DbContext context)
    {
        var entitiesWithEvents = context.ChangeTracker
            .Entries<IDomainEventEntities>()
            .Select(e => e.Entity)
            .Where(e => e.DomainEvents.Count > 0)
            .ToList();

        if (entitiesWithEvents.Count == 0)
            return Task.CompletedTask;

        var outboxRecords = entitiesWithEvents
            .SelectMany(e => e.DomainEvents.Select(ev => new Outbox
            {
                Id = Guid.NewGuid(),
                EventName = ev.EventName,
                Payload = JsonSerializer.Serialize(ev, ev.GetType()),
                Status = OutboxStatus.Sent,
                CreatedDate = DateTime.UtcNow
            }))
            .ToList();

        foreach (var entity in entitiesWithEvents)
            entity.ClearDomainEvents();

        context.Set<Outbox>().AddRange(outboxRecords);

        return Task.CompletedTask;
    }
}
