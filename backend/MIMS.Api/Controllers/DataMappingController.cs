using MediatR;
using Microsoft.AspNetCore.Mvc;
using MIMS.Application.DataMappings.Commands.CreateDataMapping;
using MIMS.Application.DataMappings.Queries.GetDataMappingList;

namespace MIMS.Api.Controllers;

[ApiController]
[Route("api/data-mapping")]
public class DataMappingController(IMediator mediator) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetList(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? mappingName = null,
        CancellationToken cancellationToken = default)
    {
        var result = await mediator.Send(
            new GetDataMappingListQuery(page, pageSize, mappingName),
            cancellationToken);
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create(
        [FromBody] CreateDataMappingCommand command,
        CancellationToken cancellationToken = default)
    {
        var result = await mediator.Send(command, cancellationToken);
        return CreatedAtAction(nameof(Create), new { id = result.Id }, result);
    }
}
