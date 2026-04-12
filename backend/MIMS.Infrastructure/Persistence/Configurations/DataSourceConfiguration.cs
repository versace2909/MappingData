using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MIMS.Core.Entities;

namespace MIMS.Infrastructure.Persistence.Configurations;

public class DataSourceConfiguration : IEntityTypeConfiguration<DataSource>
{
    public void Configure(EntityTypeBuilder<DataSource> builder)
    {
        builder.ToTable("data_source");

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

        builder.Property(x => x.DataSourceName)
            .HasColumnName("data_source_name")
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(x => x.FileName)
            .HasColumnName("file_name")
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(x => x.FileSize)
            .HasColumnName("file_size")
            .IsRequired();

        builder.Property(x => x.FileExtension)
            .HasColumnName("file_extension")
            .IsRequired()
            .HasMaxLength(10);

        builder.HasMany(x => x.DataSourceDetails)
            .WithOne(x => x.DataSource)
            .HasForeignKey(x => x.DataSourceId);
    }
}
