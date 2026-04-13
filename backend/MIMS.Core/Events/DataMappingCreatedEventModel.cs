namespace MIMS.Core.Events;

public record DataMappingCreatedEventModel(int DataMappingId)
    : BaseEventModel(EventNameConst)
{
    public const string EventNameConst = "DataMappingCreated";
}
