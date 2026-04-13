namespace MIMS.Core.Entities;

public enum OutboxStatus
{
    Sent,
    Processing,
    Failed,
    Success
}
