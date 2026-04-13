using MIMS.Core.Entities.Common;

namespace MIMS.Core.Entities;

public class DataMappingDetail : BaseEntity
{
    public int DataMappingId { get; set; }
    public int SourceDataId { get; set; }
    public int? TargetDataId { get; set; }
    public MappingType MappingType { get; set; } = MappingType.Auto;
    public bool IsVerified { get; set; }
    public double? Score { get; set; }

    public DataMapping DataMapping { get; set; } = null!;
    public DataSourceDetail SourceData { get; set; } = null!;
    public DataSourceDetail? TargetData { get; set; }
}
