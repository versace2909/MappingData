using MediatR;
using Microsoft.EntityFrameworkCore;
using MIMS.Application.Common.Interfaces;
using MIMS.Application.DataSources.Queries.GetDataSourceDetails;

namespace MIMS.Application.DataSources.Queries.SearchDataSourceDetails;

public class SearchDataSourceDetailsQueryHandler(IApplicationDbContext dbContext)
    : IRequestHandler<SearchDataSourceDetailsQuery, SearchDataSourceDetailsPagedResult>
{
    public async Task<SearchDataSourceDetailsPagedResult> Handle(
        SearchDataSourceDetailsQuery request,
        CancellationToken cancellationToken)
    {
        var page = request.Page < 1 ? 1 : request.Page;
        var pageSize = request.PageSize < 1 ? 20 : request.PageSize;

        if (!string.IsNullOrWhiteSpace(request.Query))
        {
            var (items, totalCount) = await dbContext.SearchDataSourceDetailsAsync(
                request.DataSourceId,
                request.Query,
                page,
                pageSize,
                cancellationToken);

            return new SearchDataSourceDetailsPagedResult(items, totalCount, page, pageSize);
        }
        else
        {
            // No query: return all rows ordered by id with score = 0
            var query = dbContext.DataSourceDetails
                .Where(d => d.DataSourceId == request.DataSourceId);

            var totalCount = await query.CountAsync(cancellationToken);

            var items = await query
                .OrderBy(d => d.Id)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(d => new SearchDataSourceDetailDto(
                    d.PrimaryColumnData,
                    d.DescriptionColumnData,
                    d.NormalizeColumnData,
                    0))
                .ToListAsync(cancellationToken);

            return new SearchDataSourceDetailsPagedResult(items, totalCount, page, pageSize);
        }
    }
}
