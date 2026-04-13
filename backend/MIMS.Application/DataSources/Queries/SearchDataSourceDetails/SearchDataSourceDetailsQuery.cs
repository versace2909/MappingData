using MediatR;

namespace MIMS.Application.DataSources.Queries.SearchDataSourceDetails;

public record SearchDataSourceDetailsQuery(
    int DataSourceId,
    string? Query = null,
    int Page = 1,
    int PageSize = 20)
    : IRequest<SearchDataSourceDetailsPagedResult>;
