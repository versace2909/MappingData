using MediatR;
using Microsoft.EntityFrameworkCore;
using MIMS.Application.Common.Interfaces;
using MIMS.Application.Common.Models;

namespace MIMS.Application.DataMappings.Queries.GetDataMappingDetails;

public class GetDataMappingDetailsQueryHandler(IApplicationDbContext dbContext)
    : IRequestHandler<GetDataMappingDetailsQuery, PagedResult<DataMappingDetailItemDto>?>
{
    public async Task<PagedResult<DataMappingDetailItemDto>?> Handle(
        GetDataMappingDetailsQuery request,
        CancellationToken cancellationToken)
    {
        var mappingExists = await dbContext.DataMappings
            .AnyAsync(m => m.Id == request.MappingId, cancellationToken);

        if (!mappingExists)
            return null;

        var page = request.Page < 1 ? 1 : request.Page;
        var pageSize = request.PageSize < 1 ? 20 : request.PageSize;

        var query = dbContext.DataMappingDetails
            .Where(d => d.DataMappingId == request.MappingId);

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderBy(d => d.Id)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(d => new DataMappingDetailItemDto(
                d.Id,
                d.SourceData.PrimaryColumnData,
                d.SourceData.DescriptionColumnData,
                d.TargetData != null ? d.TargetData.PrimaryColumnData : null,
                d.TargetData != null ? d.TargetData.DescriptionColumnData : null,
                d.MappingType.ToString(),
                d.IsVerified,
                d.Score))
            .ToListAsync(cancellationToken);

        return new PagedResult<DataMappingDetailItemDto>(items, totalCount, page, pageSize);
    }
}
