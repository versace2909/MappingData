using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MIMS.Core.Entities;

namespace MIMS.Infrastructure.Persistence.Configurations;

public class DataMappingDetailConfiguration : IEntityTypeConfiguration<DataMappingDetail>
{
    public void Configure(EntityTypeBuilder<DataMappingDetail> builder)
    {
        builder.ToTable("data_mapping_detail");

        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).HasColumnName("id");

        builder.Property(x => x.CreatedDate)
            .HasColumnName("created_date")
            .IsRequired();

        builder.Property(x => x.UpdatedDate)
            .HasColumnName("updated_date");

        builder.Property(x => x.CreatedBy)
            .HasColumnName("created_by")
            .HasMaxLength(200);

        builder.Property(x => x.UpdatedBy)
            .HasColumnName("updated_by")
            .HasMaxLength(200);

        builder.Property(x => x.DataMappingId)
            .HasColumnName("data_mapping_id")
            .IsRequired();

        builder.Property(x => x.SourceDataId)
            .HasColumnName("source_data_id")
            .IsRequired();

        builder.Property(x => x.TargetDataId)
            .HasColumnName("target_data_id");

        builder.Property(x => x.MappingType)
            .HasColumnName("mapping_type")
            .HasConversion<string>()
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(x => x.IsVerified)
            .HasColumnName("is_verified")
            .IsRequired();

        builder.Property(x => x.Score)
            .HasColumnName("score");

        builder.HasOne(x => x.DataMapping)
            .WithMany()
            .HasForeignKey(x => x.DataMappingId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.SourceData)
            .WithMany()
            .HasForeignKey(x => x.SourceDataId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.TargetData)
            .WithMany()
            .HasForeignKey(x => x.TargetDataId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
