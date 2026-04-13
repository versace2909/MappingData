using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MIMS.Core.Entities;

namespace MIMS.Infrastructure.Persistence.Configurations;

public class DataMappingConfiguration : IEntityTypeConfiguration<DataMapping>
{
    public void Configure(EntityTypeBuilder<DataMapping> builder)
    {
        builder.ToTable("data_mapping");

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

        builder.Property(x => x.MappingName)
            .HasColumnName("mapping_name")
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(x => x.SourceDataId)
            .HasColumnName("source_data_id")
            .IsRequired();

        builder.Property(x => x.TargetDataId)
            .HasColumnName("target_data_id")
            .IsRequired();

        builder.Property(x => x.Status)
            .HasColumnName("status")
            .HasConversion<string>()
            .HasMaxLength(50)
            .IsRequired();

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
