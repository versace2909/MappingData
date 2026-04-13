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

        var sourceDetails = await dbContext.DataSourceDetails
            .Where(d => d.DataSourceId == mapping.SourceDataId)
            .ToListAsync(cancellationToken);

        var details = new List<DataMappingDetail>(sourceDetails.Count);

        foreach (var sourceRow in sourceDetails)
        {
            var match = await dbContext.SearchBestTargetAsync(
                sourceRow.NormalizeColumnData, mapping.TargetDataId, cancellationToken);

            if (match is null)
            {
                logger.LogDebug(
                    "No BM25 match (score >= 0.75) for source detail {Id}.", sourceRow.Id);
            }

            details.Add(new DataMappingDetail
            {
                DataMappingId = mapping.Id,
                SourceDataId = sourceRow.Id,
                TargetDataId = match?.DetailId,
                Score = match?.Score,
                MappingType = MappingType.Auto,
                IsVerified = false
            });
        }

        dbContext.DataMappingDetails.AddRange(details);
        await dbContext.SaveChangesAsync(cancellationToken);

        mapping.Status = DataMappingStatus.Completed;
        await dbContext.SaveChangesAsync(cancellationToken);

        logger.LogInformation(
            "DataMapping {Id} auto-match complete: {Total} rows, {Matched} matched.",
            mapping.Id, details.Count, details.Count(d => d.TargetDataId is not null));
    }
}
