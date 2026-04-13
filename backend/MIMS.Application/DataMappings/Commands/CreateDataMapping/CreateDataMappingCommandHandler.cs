using MediatR;
using Microsoft.EntityFrameworkCore;
using MIMS.Application.Common.Interfaces;
using MIMS.Core.Entities;

namespace MIMS.Application.DataMappings.Commands.CreateDataMapping;

public class CreateDataMappingCommandHandler(IApplicationDbContext dbContext)
    : IRequestHandler<CreateDataMappingCommand, CreateDataMappingResult>
{
    public async Task<CreateDataMappingResult> Handle(
        CreateDataMappingCommand request,
        CancellationToken cancellationToken)
    {
        var sourceExists = await dbContext.DataSources
            .AnyAsync(ds => ds.Id == request.SourceDataId, cancellationToken);
        if (!sourceExists)
            throw new InvalidOperationException($"Data source with id {request.SourceDataId} does not exist.");

        var targetExists = await dbContext.DataSources
            .AnyAsync(ds => ds.Id == request.TargetDataId, cancellationToken);
        if (!targetExists)
            throw new InvalidOperationException($"Data source with id {request.TargetDataId} does not exist.");

        var mapping = new DataMapping
        {
            MappingName = request.MappingName,
            SourceDataId = request.SourceDataId,
            TargetDataId = request.TargetDataId,
            Status = DataMappingStatus.New
        };

        dbContext.DataMappings.Add(mapping);
        await dbContext.SaveChangesAsync(cancellationToken);

        return new CreateDataMappingResult(mapping.Id, mapping.Status.ToString());
    }
}
