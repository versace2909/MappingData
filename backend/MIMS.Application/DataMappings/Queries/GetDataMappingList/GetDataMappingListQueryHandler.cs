using MediatR;
using Microsoft.EntityFrameworkCore;
using MIMS.Application.Common.Interfaces;

namespace MIMS.Application.DataMappings.Queries.GetDataMappingList;

public class GetDataMappingListQueryHandler(IApplicationDbContext dbContext)
    : IRequestHandler<GetDataMappingListQuery, DataMappingPagedResult>
{
    public async Task<DataMappingPagedResult> Handle(
        GetDataMappingListQuery request,
        CancellationToken cancellationToken)
    {
        var page = request.Page < 1 ? 1 : request.Page;
        var pageSize = request.PageSize < 1 ? 10 : request.PageSize;

        var query = dbContext.DataMappings
            .Include(m => m.SourceData)
            .Include(m => m.TargetData)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.MappingName))
            query = query.Where(m => m.MappingName.Contains(request.MappingName));

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(m => m.CreatedDate)
            .ThenByDescending(m => m.Id)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(m => new DataMappingListItemDto(
                m.Id,
                m.MappingName,
                m.CreatedDate,
                m.CreatedBy,
                m.SourceData.DataSourceName,
                m.TargetData.DataSourceName,
                m.Status.ToString()))
            .ToListAsync(cancellationToken);

        return new DataMappingPagedResult(items, totalCount, page, pageSize);
    }
}
