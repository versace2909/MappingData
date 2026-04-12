namespace MIMS.Core.Entities;

public class DataSource
{
    public Guid Id { get; set; }
    public string DataSourceName { get; set; } = string.Empty;
    public string CreatedBy { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public string FileExtension { get; set; } = string.Empty;
    public DateTime CreatedDate { get; set; }
    public string? UpdatedBy { get; set; }
    public DateTime? UpdatedDate { get; set; }

    public ICollection<DataSourceDetail> DataSourceDetails { get; set; } = new List<DataSourceDetail>();
}
