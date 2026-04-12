namespace MIMS.Core.Entities.Common;

public abstract class BaseEntity
{
    public int Id { get; protected set; }
    public DateTime CreatedDate { get; protected set; } = DateTime.UtcNow;
    public DateTime? UpdatedDate { get; protected set; }
    public string? CreatedBy { get; protected set; }
    public string? UpdatedBy { get; protected set; }

    public void SetUpdatedDate(string? updatedBy = null)
    {
        UpdatedDate = DateTime.UtcNow;
        UpdatedBy = updatedBy;
    }

    public void SetCreatedBy(string? createdBy) => CreatedBy = createdBy;
}
