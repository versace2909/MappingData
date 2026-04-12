using Microsoft.EntityFrameworkCore;
using MIMS.Core.Entities;

namespace MIMS.Application.Common.Interfaces;

public interface IApplicationDbContext
{
    DbSet<DataSource> DataSources { get; }
    DbSet<DataSourceDetail> DataSourceDetails { get; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
