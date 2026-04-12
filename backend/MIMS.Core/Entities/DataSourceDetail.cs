using MIMS.Core.Entities.Common;

namespace MIMS.Core.Entities;

public class DataSourceDetail : BaseEntity
{
    public int DataSourceId { get; set; }
    public string PrimaryColumnData { get; set; } = string.Empty;
    public string DescriptionColumnData { get; set; } = string.Empty;
    public string NormalizeColumnData { get; set; } = string.Empty;

    public DataSource DataSource { get; set; } = null!;
}
