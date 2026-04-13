namespace MIMS.Application.DataMappings.Queries.GetDataMappingList;

public record DataMappingListItemDto(
    int Id,
    string MappingName,
    DateTime CreatedDate,
    string? CreatedBy,
    string SourceDataName,
    string TargetDataName,
    string Status);
