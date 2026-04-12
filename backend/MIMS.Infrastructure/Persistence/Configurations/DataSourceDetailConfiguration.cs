using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MIMS.Core.Entities;

namespace MIMS.Infrastructure.Persistence.Configurations;

public class DataSourceDetailConfiguration : IEntityTypeConfiguration<DataSourceDetail>
{
    public void Configure(EntityTypeBuilder<DataSourceDetail> builder)
    {
        builder.ToTable("data_source_detail");

        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).HasColumnName("id");

        builder.Property(x => x.DataSourceId)
            .HasColumnName("data_source_id")
            .IsRequired();

        builder.Property(x => x.PrimaryColumnData)
            .HasColumnName("primary_column_data")
            .IsRequired()
            .HasMaxLength(1000);

        builder.Property(x => x.DescriptionColumnData)
            .HasColumnName("description_column_data")
            .IsRequired()
            .HasMaxLength(2000);

        builder.Property(x => x.NormalizeColumnData)
            .HasColumnName("normalize_column_data")
            .IsRequired()
            .HasMaxLength(2000);

        builder.Property(x => x.CreatedBy)
            .HasColumnName("created_by")
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(x => x.UpdatedBy)
            .HasColumnName("updated_by")
            .HasMaxLength(200);

        builder.Property(x => x.CreatedDate)
            .HasColumnName("created_date")
            .IsRequired();

        builder.Property(x => x.UpdatedDate)
            .HasColumnName("updated_date");

        builder.HasOne(x => x.DataSource)
            .WithMany(x => x.DataSourceDetails)
            .HasForeignKey(x => x.DataSourceId);
    }
}
