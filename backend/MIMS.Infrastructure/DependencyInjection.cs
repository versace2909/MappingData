using Amazon.S3;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using MIMS.Application.Common.Interfaces;
using MIMS.Infrastructure.Parsing;
using MIMS.Infrastructure.Persistence;
using MIMS.Infrastructure.Storage;

namespace MIMS.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddDbContextFactory<AppDbContext>(options =>
            options.UseNpgsql(configuration.GetConnectionString("DefaultConnection")));

        services.AddScoped<IApplicationDbContext>(sp =>
            sp.GetRequiredService<IDbContextFactory<AppDbContext>>().CreateDbContext());

        var s3Config = configuration.GetSection("S3");
        var serviceUrl = s3Config["ServiceURL"];
        var forcePathStyle = bool.TryParse(s3Config["ForcePathStyle"], out var fp) && fp;

        services.AddSingleton<IAmazonS3>(_ =>
        {
            var config = new AmazonS3Config
            {
                RegionEndpoint = Amazon.RegionEndpoint.USEast1,
                ForcePathStyle = forcePathStyle
            };

            if (!string.IsNullOrEmpty(serviceUrl))
            {
                config.ServiceURL = serviceUrl;
            }

            return new AmazonS3Client("test", "test", config);
        });

        services.AddScoped<IFileStorageService, S3FileStorageService>();
        services.AddScoped<IFileParserService, FileParserService>();

        return services;
    }
}
