using ClosedXML.Excel;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using MIMS.Application.Common.Exceptions;
using MIMS.Application.DataSources.Commands.UploadDataSource;
using MIMS.Application.DataSources.Queries.GetDataSources;
using MIMS.Application.DataSources.Queries.GetRecentDataSources;

namespace MIMS.Api.Controllers;

[ApiController]
[Route("api/data-sources")]
public class FileController(IMediator mediator) : ControllerBase
{
    private static readonly HashSet<string> AllowedExtensions =
        new(StringComparer.OrdinalIgnoreCase) { ".xlsx", ".csv" };

    [HttpPost("upload")]
    [RequestSizeLimit(10_485_760)] // 10 MB
    public async Task<IActionResult> Upload(
        [FromForm] string dataSourceName,
        IFormFile file,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(dataSourceName))
            return BadRequest(new { error = "Data source name is required." });

        if (file == null || file.Length == 0)
            return BadRequest(new { error = "A file must be provided." });

        var extension = Path.GetExtension(file.FileName);
        if (!AllowedExtensions.Contains(extension))
            return BadRequest(new { error = $"Unsupported file type '{extension}'. Allowed: .xlsx, .csv" });

        try
        {
            var memoryStream = new MemoryStream();
            await using (var rawStream = file.OpenReadStream())
                await rawStream.CopyToAsync(memoryStream, cancellationToken);
            memoryStream.Seek(0, SeekOrigin.Begin);

            var command = new UploadDataSourceCommand(
                DataSourceName: dataSourceName,
                FileStream: memoryStream,
                FileName: file.FileName,
                FileSize: file.Length,
                FileExtension: extension,
                ContentType: file.ContentType);

            var result = await mediator.Send(command, cancellationToken);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (StorageException)
        {
            return StatusCode(503, new { error = "File storage service is unavailable. Please try again later." });
        }
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken cancellationToken = default)
    {
        var result = await mediator.Send(new GetDataSourcesQuery(page, pageSize), cancellationToken);
        return Ok(result);
    }

    [HttpGet("recent")]
    public async Task<IActionResult> GetRecent(
        [FromQuery] string? sourceName,
        CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new GetRecentDataSourcesQuery(sourceName), cancellationToken);
        return Ok(result);
    }

    [HttpGet("template")]
    public IActionResult GetTemplate()
    {
        using var workbook = new XLWorkbook();
        var worksheet = workbook.Worksheets.Add("Template");
        worksheet.Cell(1, 1).Value = "primary";
        worksheet.Cell(1, 2).Value = "description";

        var stream = new MemoryStream();
        workbook.SaveAs(stream);
        stream.Seek(0, SeekOrigin.Begin);

        return File(stream,
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "data-source-template.xlsx");
    }
}
