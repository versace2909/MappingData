namespace MIMS.Core.Entities;

public class Outbox
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string EventName { get; set; } = string.Empty;
    public string Payload { get; set; } = string.Empty;
    public OutboxStatus Status { get; set; } = OutboxStatus.Sent;
    public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedDate { get; set; }
    public string? CreatedBy { get; set; }
    public string? UpdatedBy { get; set; }
}
