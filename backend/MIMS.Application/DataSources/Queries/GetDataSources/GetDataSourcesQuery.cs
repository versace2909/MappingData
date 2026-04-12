using MediatR;

namespace MIMS.Application.DataSources.Queries.GetDataSources;

public record GetDataSourcesQuery(int Page = 1, int PageSize = 10)
    : IRequest<DataSourcesPagedResult>;
