using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using MIMS.Application.Common.Interfaces;
using MIMS.Core.Entities;
using MIMS.Core.Events;

namespace MIMS.Application.Events;

public class DataMappingCreatedEventHandler(
    IApplicationDbContext dbContext,
    ILogger<DataMappingCreatedEventHandler> logger)
    : IEventHandler<DataMappingCreatedEventModel>
{
    public async Task HandleAsync(DataMappingCreatedEventModel @event, CancellationToken cancellationToken)
    {
        var mapping = await dbContext.DataMappings
            .FirstOrDefaultAsync(m => m.Id == @event.DataMappingId, cancellationToken);

        if (mapping is null)
        {
            logger.LogWarning("DataMapping with id {Id} not found; skipping event.", @event.DataMappingId);
            return;
        }

        if (mapping.Status != DataMappingStatus.New)
        {
            logger.LogInformation(
                "DataMapping {Id} already in status {Status}; skipping.", mapping.Id, mapping.Status);
            return;
        }

        mapping.Status = DataMappingStatus.Processing;
        await dbContext.SaveChangesAsync(cancellationToken);

        logger.LogInformation("DataMapping {Id} status set to Processing.", mapping.Id);
    }
}
