using MediatR;

namespace MIMS.Application.DataSources.Commands.UploadDataSource;

public record UploadDataSourceCommand(
    string DataSourceName,
    Stream FileStream,
    string FileName,
    long FileSize,
    string FileExtension,
    string ContentType) : IRequest<UploadDataSourceResult>;
