using MIMS.Core.Entities.Common;

namespace MIMS.Core.Entities;

public class DataMapping : BaseEntity
{
    public string MappingName { get; set; } = string.Empty;
    public int SourceDataId { get; set; }
    public int TargetDataId { get; set; }
    public DataMappingStatus Status { get; set; } = DataMappingStatus.New;

    public DataSource SourceData { get; set; } = null!;
    public DataSource TargetData { get; set; } = null!;
}
