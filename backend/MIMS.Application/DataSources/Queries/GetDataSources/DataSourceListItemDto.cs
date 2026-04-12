namespace MIMS.Application.DataSources.Queries.GetDataSources;

public record DataSourceListItemDto(
    Guid Id,
    string DataSourceName,
    DateTime CreatedDate,
    string CreatedBy);

public record DataSourcesPagedResult(
    List<DataSourceListItemDto> Items,
    int TotalCount,
    int Page,
    int PageSize);
