using MIMS.Core.Entities.Common;

namespace MIMS.Core.Entities;

public class DataSource : BaseEntity
{
    public string DataSourceName { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public string FileExtension { get; set; } = string.Empty;

    public ICollection<DataSourceDetail> DataSourceDetails { get; set; } = new List<DataSourceDetail>();
}
