using ClosedXML.Excel;
using CsvHelper;
using CsvHelper.Configuration;
using MIMS.Application.Common.Interfaces;
using MIMS.Application.Common.Models;
using System.Globalization;

namespace MIMS.Infrastructure.Parsing;

public class FileParserService : IFileParserService
{
    public IReadOnlyList<DataSourceRow> Parse(Stream fileStream, string extension)
    {
        return extension.ToLowerInvariant() switch
        {
            ".xlsx" => ParseExcel(fileStream),
            ".csv" => ParseCsv(fileStream),
            _ => throw new ArgumentException($"Unsupported file extension: {extension}")
        };
    }

    private static IReadOnlyList<DataSourceRow> ParseExcel(Stream fileStream)
    {
        using var workbook = new XLWorkbook(fileStream);
        var worksheet = workbook.Worksheets.First();
        var rows = worksheet.RangeUsed()?.RowsUsed().ToList();

        if (rows == null || rows.Count == 0)
            throw new InvalidOperationException("The file is empty.");

        var headerRow = rows[0];
        var headers = headerRow.Cells()
            .Select(c => c.GetString().Trim().ToLowerInvariant())
            .ToList();

        ValidateHeaders(headers);

        int primaryIndex = headers.IndexOf("primary");
        int descriptionIndex = headers.IndexOf("description");

        var result = new List<DataSourceRow>();
        foreach (var row in rows.Skip(1))
        {
            var primary = row.Cell(primaryIndex + 1).GetString().Trim();
            var description = row.Cell(descriptionIndex + 1).GetString().Trim();
            result.Add(new DataSourceRow(primary, description));
        }

        return result;
    }

    private static IReadOnlyList<DataSourceRow> ParseCsv(Stream fileStream)
    {
        using var reader = new StreamReader(fileStream, leaveOpen: true);
        var config = new CsvConfiguration(CultureInfo.InvariantCulture)
        {
            HasHeaderRecord = true,
            TrimOptions = TrimOptions.Trim
        };
        using var csv = new CsvReader(reader, config);

        csv.Read();
        csv.ReadHeader();

        var headers = csv.HeaderRecord?
            .Select(h => h.Trim().ToLowerInvariant())
            .ToList() ?? [];

        ValidateHeaders(headers);

        int primaryIndex = headers.IndexOf("primary");
        int descriptionIndex = headers.IndexOf("description");

        var result = new List<DataSourceRow>();
        while (csv.Read())
        {
            var primary = (csv.GetField(primaryIndex) ?? string.Empty).Trim();
            var description = (csv.GetField(descriptionIndex) ?? string.Empty).Trim();
            result.Add(new DataSourceRow(primary, description));
        }

        return result;
    }

    private static void ValidateHeaders(List<string> headers)
    {
        if (headers.Count != 2 || !headers.Contains("primary") || !headers.Contains("description"))
        {
            throw new InvalidOperationException(
                "File does not match the template. Expected exactly two columns: 'primary' and 'description'.");
        }
    }
}
