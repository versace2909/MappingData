using MIMS.Core.Events;

namespace MIMS.Application.Events;

public interface IEventHandler<T> where T : BaseEventModel
{
    Task HandleAsync(T @event, CancellationToken cancellationToken);
}
