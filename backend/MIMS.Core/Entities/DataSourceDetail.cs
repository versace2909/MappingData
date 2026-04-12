namespace MIMS.Core.Entities;

public class DataSourceDetail
{
    public Guid Id { get; set; }
    public Guid DataSourceId { get; set; }
    public string PrimaryColumnData { get; set; } = string.Empty;
    public string DescriptionColumnData { get; set; } = string.Empty;
    public string NormalizeColumnData { get; set; } = string.Empty;
    public string CreatedBy { get; set; } = string.Empty;
    public string? UpdatedBy { get; set; }
    public DateTime CreatedDate { get; set; }
    public DateTime? UpdatedDate { get; set; }

    public DataSource DataSource { get; set; } = null!;
}
