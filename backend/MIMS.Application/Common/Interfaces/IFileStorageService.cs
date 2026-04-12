namespace MIMS.Application.Common.Interfaces;

public interface IFileStorageService
{
    Task<string> UploadAsync(Stream fileStream, string key, string contentType, CancellationToken ct);
    Task<string> GetDownloadUrlAsync(string key, TimeSpan expiry);
}
