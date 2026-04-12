using MediatR;
using MIMS.Application.Common.Helpers;
using MIMS.Application.Common.Interfaces;
using MIMS.Core.Entities;

namespace MIMS.Application.DataSources.Commands.UploadDataSource;

public class UploadDataSourceCommandHandler(
    IFileParserService fileParserService,
    IFileStorageService fileStorageService,
    IApplicationDbContext dbContext)
    : IRequestHandler<UploadDataSourceCommand, UploadDataSourceResult>
{
    public async Task<UploadDataSourceResult> Handle(UploadDataSourceCommand request, CancellationToken cancellationToken)
    {
        var rows = fileParserService.Parse(request.FileStream, request.FileExtension);

        if (rows.Count == 0)
            throw new InvalidOperationException("The file contains no data rows.");

        var duplicates = rows
            .GroupBy(r => r.Primary.ToLowerInvariant())
            .Where(g => g.Count() > 1)
            .Select(g => g.Key)
            .ToList();

        if (duplicates.Count > 0)
            throw new InvalidOperationException(
                $"Duplicate values found in the 'primary' column: {string.Join(", ", duplicates)}");

        var tempId = Guid.NewGuid();
        var s3Key = $"data-sources/{tempId}/{request.FileName}";

        request.FileStream.Seek(0, SeekOrigin.Begin);
        await fileStorageService.UploadAsync(request.FileStream, s3Key, request.ContentType, cancellationToken);

        var dataSource = new DataSource
        {
            DataSourceName = request.DataSourceName,
            FileName = request.FileName,
            FileSize = request.FileSize,
            FileExtension = request.FileExtension,
        };
        dataSource.SetCreatedBy("Admin");

        dbContext.DataSources.Add(dataSource);
        await dbContext.SaveChangesAsync(cancellationToken);

        var details = rows.Select(row =>
        {
            var detail = new DataSourceDetail
            {
                DataSourceId = dataSource.Id,
                PrimaryColumnData = row.Primary,
                DescriptionColumnData = row.Description,
                NormalizeColumnData = TextNormalizer.Normalize(row.Description),
            };
            detail.SetCreatedBy("Admin");
            return detail;
        }).ToList();

        dbContext.DataSourceDetails.AddRange(details);
        await dbContext.SaveChangesAsync(cancellationToken);

        return new UploadDataSourceResult(dataSource.Id, dataSource.DataSourceName);
    }
}
