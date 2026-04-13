namespace MIMS.Core.Events;

public interface IDomainEventEntities
{
    IReadOnlyList<BaseEventModel> DomainEvents { get; }
    void AddDomainEvent(BaseEventModel @event);
    void ClearDomainEvents();
}
