using MIMS.Application.Common.Models;

namespace MIMS.Application.Common.Interfaces;

public interface IFileParserService
{
    IReadOnlyList<DataSourceRow> Parse(Stream fileStream, string extension);
}
