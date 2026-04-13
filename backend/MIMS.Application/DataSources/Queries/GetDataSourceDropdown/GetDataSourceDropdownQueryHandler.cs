using MediatR;
using Microsoft.EntityFrameworkCore;
using MIMS.Application.Common.Interfaces;

namespace MIMS.Application.DataSources.Queries.GetDataSourceDropdown;

public class GetDataSourceDropdownQueryHandler(IApplicationDbContext dbContext)
    : IRequestHandler<GetDataSourceDropdownQuery, List<DataSourceDropdownItemDto>>
{
    public async Task<List<DataSourceDropdownItemDto>> Handle(
        GetDataSourceDropdownQuery request,
        CancellationToken cancellationToken)
    {
        return await dbContext.DataSources
            .OrderBy(ds => ds.DataSourceName)
            .Select(ds => new DataSourceDropdownItemDto(ds.Id, ds.DataSourceName))
            .ToListAsync(cancellationToken);
    }
}
