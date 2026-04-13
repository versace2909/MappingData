namespace MIMS.Application.DataSources.Queries.SearchDataSourceDetails;

public record SearchDataSourceDetailDto(
    string Primary,
    string Description,
    string Normalized,
    double Score);

public record SearchDataSourceDetailsPagedResult(
    List<SearchDataSourceDetailDto> Items,
    int TotalCount,
    int Page,
    int PageSize);
