using Amazon.S3;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using MIMS.Application.Common.Interfaces;
using MIMS.Application.Events;
using MIMS.Core.Events;
using MIMS.Infrastructure.Events;
using MIMS.Infrastructure.Interceptors;
using MIMS.Infrastructure.Jobs;
using MIMS.Infrastructure.Parsing;
using MIMS.Infrastructure.Persistence;
using MIMS.Infrastructure.Storage;
using Quartz;
using StackExchange.Redis;

namespace MIMS.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // EF Core with DomainEventInterceptor
        services.AddSingleton<DomainEventInterceptor>();

        services.AddDbContextFactory<AppDbContext>((sp, options) =>
        {
            options.UseNpgsql(configuration.GetConnectionString("DefaultConnection"));
            options.AddInterceptors(sp.GetRequiredService<DomainEventInterceptor>());
        });

        services.AddScoped<IApplicationDbContext>(sp =>
            sp.GetRequiredService<IDbContextFactory<AppDbContext>>().CreateDbContext());

        // S3
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
                config.ServiceURL = serviceUrl;

            return new AmazonS3Client("test", "test", config);
        });

        services.AddScoped<IFileStorageService, S3FileStorageService>();
        services.AddScoped<IFileParserService, FileParserService>();

        // Redis
        var redisConnectionString = configuration["Redis:ConnectionString"] ?? "localhost:6379";
        services.AddSingleton<IConnectionMultiplexer>(
            ConnectionMultiplexer.Connect(redisConnectionString));
        services.AddSingleton<ISubscriber>(sp =>
            sp.GetRequiredService<IConnectionMultiplexer>().GetSubscriber());

        // Event handlers
        services.AddScoped<IEventHandler<DataMappingCreatedEventModel>, DataMappingCreatedEventHandler>();
        services.AddSingleton<EventHandlerRegistry>();

        // Redis subscriber
        services.AddHostedService<RedisEventSubscriber>();

        // Quartz
        var intervalSecondsRaw = configuration["Outbox:IntervalSeconds"];
        var intervalSeconds = int.TryParse(intervalSecondsRaw, out var parsed) ? parsed : 10;

        services.AddQuartz(q =>
        {
            var jobKey = new JobKey("OutboxProcessingJob");
            q.AddJob<OutboxProcessingJob>(opts => opts.WithIdentity(jobKey));
            q.AddTrigger(opts => opts
                .ForJob(jobKey)
                .WithIdentity("OutboxProcessingJob-trigger")
                .WithSimpleSchedule(s => s
                    .WithIntervalInSeconds(intervalSeconds)
                    .RepeatForever()));
        });

        services.AddQuartzHostedService(opt => opt.WaitForJobsToComplete = true);

        return services;
    }
}
