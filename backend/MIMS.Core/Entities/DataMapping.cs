using MIMS.Core.Entities.Common;
using MIMS.Core.Events;

namespace MIMS.Core.Entities;

public class DataMapping : BaseEntity, IDomainEventEntities
{
    private readonly List<BaseEventModel> _domainEvents = [];

    public string MappingName { get; set; } = string.Empty;
    public int SourceDataId { get; set; }
    public int TargetDataId { get; set; }
    public DataMappingStatus Status { get; set; } = DataMappingStatus.New;

    public DataSource SourceData { get; set; } = null!;
    public DataSource TargetData { get; set; } = null!;

    public IReadOnlyList<BaseEventModel> DomainEvents => _domainEvents.AsReadOnly();

    public void AddDomainEvent(BaseEventModel @event) => _domainEvents.Add(@event);

    public void ClearDomainEvents() => _domainEvents.Clear();
}
