using MediatR;

namespace MIMS.Application.DataSources.Queries.GetDataSourceDropdown;

public record GetDataSourceDropdownQuery : IRequest<List<DataSourceDropdownItemDto>>;
