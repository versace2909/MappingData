using Microsoft.EntityFrameworkCore;
using MIMS.Application.Common.Interfaces;
using MIMS.Core.Entities;

namespace MIMS.Infrastructure.Persistence;

public class AppDbContext(DbContextOptions<AppDbContext> options)
    : DbContext(options), IApplicationDbContext
{
    public DbSet<DataSource> DataSources => Set<DataSource>();
    public DbSet<DataSourceDetail> DataSourceDetails => Set<DataSourceDetail>();
    public DbSet<DataMapping> DataMappings => Set<DataMapping>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }
}
