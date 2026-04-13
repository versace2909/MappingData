using MediatR;
using Microsoft.EntityFrameworkCore;
using MIMS.Application.Common.Interfaces;

namespace MIMS.Application.DataSources.Queries.GetDataSourceDetails;

public class GetDataSourceDetailsQueryHandler(IApplicationDbContext dbContext)
    : IRequestHandler<GetDataSourceDetailsQuery, DataSourceDetailsPagedResult>
{
    public async Task<DataSourceDetailsPagedResult> Handle(
        GetDataSourceDetailsQuery request,
        CancellationToken cancellationToken)
    {
        var page = request.Page < 1 ? 1 : request.Page;
        var pageSize = request.PageSize < 1 ? 10 : request.PageSize;

        var query = dbContext.DataSourceDetails
            .Where(d => d.DataSourceId == request.DataSourceId);

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderBy(d => d.CreatedDate)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(d => new DataSourceDetailDto(
                d.PrimaryColumnData,
                d.DescriptionColumnData,
                d.NormalizeColumnData))
            .ToListAsync(cancellationToken);

        return new DataSourceDetailsPagedResult(items, totalCount, page, pageSize);
    }
}
