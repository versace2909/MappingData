using MediatR;

namespace MIMS.Application.DataSources.Queries.GetRecentDataSources;

public record GetRecentDataSourcesQuery(string? SourceName) : IRequest<List<RecentDataSourceDto>>;
