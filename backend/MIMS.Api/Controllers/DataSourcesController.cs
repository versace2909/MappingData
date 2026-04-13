using MediatR;
using Microsoft.AspNetCore.Mvc;
using MIMS.Application.DataSources.Queries.GetDataSourceDetails;
using MIMS.Application.DataSources.Queries.GetDataSourceDropdown;
using MIMS.Application.DataSources.Queries.SearchDataSourceDetails;

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

    [HttpGet("{id:int}/details/search")]
    public async Task<IActionResult> SearchDetails(
        int id,
        [FromQuery] string? query = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        var result = await mediator.Send(
            new SearchDataSourceDetailsQuery(id, query, page, pageSize),
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
