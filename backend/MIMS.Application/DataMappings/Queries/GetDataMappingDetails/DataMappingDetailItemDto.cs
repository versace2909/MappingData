namespace MIMS.Application.DataMappings.Queries.GetDataMappingDetails;

public record DataMappingDetailItemDto(
    int Id,
    string SourceCode,
    string SourceDescription,
    string? TargetCode,
    string? TargetDescription,
    string MappingType,
    bool IsVerified,
    double? Score);
