using MediatR;

namespace MIMS.Application.DataSources.Queries.GetDataSourceDetails;

public record GetDataSourceDetailsQuery(int DataSourceId, int Page = 1, int PageSize = 10)
    : IRequest<DataSourceDetailsPagedResult>;
