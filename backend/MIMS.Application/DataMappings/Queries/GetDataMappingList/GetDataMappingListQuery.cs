using MediatR;

namespace MIMS.Application.DataMappings.Queries.GetDataMappingList;

public record GetDataMappingListQuery(
    int Page,
    int PageSize,
    string? MappingName) : IRequest<DataMappingPagedResult>;

public record DataMappingPagedResult(
    List<DataMappingListItemDto> Items,
    int TotalCount,
    int Page,
    int PageSize);
