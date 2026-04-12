namespace MIMS.Application.DataSources.Queries.GetDataSourceDetails;

public record DataSourceDetailDto(
    string Primary,
    string Description);

public record DataSourceDetailsPagedResult(
    List<DataSourceDetailDto> Items,
    int TotalCount,
    int Page,
    int PageSize);
