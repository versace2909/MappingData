using MediatR;
using Microsoft.AspNetCore.Mvc;
using MIMS.Application.DataSources.Queries.GetDataSourceDetails;
using MIMS.Application.DataSources.Queries.GetDataSourceDropdown;

namespace MIMS.Api.Controllers;

[ApiController]
[Route("api/data-sources")]
public class DataSourcesController(IMediator mediator) : ControllerBase
{
    [HttpGet("{id:int}/details")]
    public async Task<IActionResult> GetDetails(
        int id,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken cancellationToken = default)
    {
        var result = await mediator.Send(
            new GetDataSourceDetailsQuery(id, page, pageSize),
            cancellationToken);
        return Ok(result);
    }

    [HttpGet("list-dropdown")]
    public async Task<IActionResult> ListDropdown(CancellationToken cancellationToken = default)
    {
        var result = await mediator.Send(new GetDataSourceDropdownQuery(), cancellationToken);
        return Ok(result);
    }
}
