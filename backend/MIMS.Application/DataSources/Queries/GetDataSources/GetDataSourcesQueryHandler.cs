using MediatR;
using Microsoft.EntityFrameworkCore;
using MIMS.Application.Common.Interfaces;

namespace MIMS.Application.DataSources.Queries.GetDataSources;

public class GetDataSourcesQueryHandler(IApplicationDbContext dbContext)
    : IRequestHandler<GetDataSourcesQuery, DataSourcesPagedResult>
{
    public async Task<DataSourcesPagedResult> Handle(
        GetDataSourcesQuery request,
        CancellationToken cancellationToken)
    {
        var page = request.Page < 1 ? 1 : request.Page;
        var pageSize = request.PageSize < 1 ? 10 : request.PageSize;

        var totalCount = await dbContext.DataSources.CountAsync(cancellationToken);

        var items = await dbContext.DataSources
            .OrderByDescending(ds => ds.CreatedDate)
            .ThenByDescending(ds => ds.Id)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(ds => new DataSourceListItemDto(
                ds.Id,
                ds.DataSourceName,
                ds.CreatedDate,
                ds.CreatedBy))
            .ToListAsync(cancellationToken);

        return new DataSourcesPagedResult(items, totalCount, page, pageSize);
    }
}
