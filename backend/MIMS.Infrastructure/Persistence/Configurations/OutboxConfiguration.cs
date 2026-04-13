using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MIMS.Core.Entities;

namespace MIMS.Infrastructure.Persistence.Configurations;

public class OutboxConfiguration : IEntityTypeConfiguration<Outbox>
{
    public void Configure(EntityTypeBuilder<Outbox> builder)
    {
        builder.HasKey(o => o.Id);

        builder.Property(o => o.EventName)
            .IsRequired()
            .HasMaxLength(256);

        builder.Property(o => o.Payload)
            .IsRequired()
            .HasMaxLength(1000);

        builder.Property(o => o.Status)
            .IsRequired()
            .HasConversion<string>();

        builder.Property(o => o.CreatedDate).IsRequired();
    }
}
