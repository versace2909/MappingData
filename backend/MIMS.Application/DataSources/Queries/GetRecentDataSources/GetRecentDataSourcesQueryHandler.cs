using MediatR;
using Microsoft.EntityFrameworkCore;
using MIMS.Application.Common.Interfaces;

namespace MIMS.Application.DataSources.Queries.GetRecentDataSources;

public class GetRecentDataSourcesQueryHandler(
    IApplicationDbContext dbContext,
    IFileStorageService fileStorageService)
    : IRequestHandler<GetRecentDataSourcesQuery, List<RecentDataSourceDto>>
{
    private static readonly TimeSpan DownloadUrlExpiry = TimeSpan.FromHours(1);

    public async Task<List<RecentDataSourceDto>> Handle(
        GetRecentDataSourcesQuery request,
        CancellationToken cancellationToken)
    {
        var query = dbContext.DataSources.AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.SourceName))
        {
            var filter = request.SourceName.ToLower();
            query = query.Where(ds => ds.DataSourceName.ToLower().Contains(filter));
        }

        var dataSources = await query
            .OrderByDescending(ds => ds.CreatedDate)
            .Take(10)
            .Select(ds => new { ds.Id, ds.DataSourceName, ds.CreatedDate, ds.FileSize, ds.FileName })
            .ToListAsync(cancellationToken);

        var result = new List<RecentDataSourceDto>(dataSources.Count);
        foreach (var ds in dataSources)
        {
            var key = $"data-sources/{ds.Id}/{ds.FileName}";
            var downloadUrl = await fileStorageService.GetDownloadUrlAsync(key, DownloadUrlExpiry);
            result.Add(new RecentDataSourceDto(ds.DataSourceName, ds.CreatedDate, ds.FileSize, downloadUrl));
        }

        return result;
    }
}
