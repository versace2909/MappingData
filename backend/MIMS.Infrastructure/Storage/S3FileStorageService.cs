using Amazon.S3;
using Amazon.S3.Model;
using Microsoft.Extensions.Configuration;
using MIMS.Application.Common.Exceptions;
using MIMS.Application.Common.Interfaces;

namespace MIMS.Infrastructure.Storage;

public class S3FileStorageService(IAmazonS3 s3Client, IConfiguration configuration) : IFileStorageService
{
    private readonly string _bucketName = configuration["S3:BucketName"] ?? "mims-data-sources";
    private readonly Protocol _urlProtocol = (configuration["S3:ServiceURL"] ?? "").StartsWith("http://")
        ? Protocol.HTTP
        : Protocol.HTTPS;

    public async Task<string> UploadAsync(Stream fileStream, string key, string contentType, CancellationToken ct)
    {
        try
        {
            var request = new PutObjectRequest
            {
                BucketName = _bucketName,
                Key = key,
                InputStream = fileStream,
                ContentType = contentType
            };

            await s3Client.PutObjectAsync(request, ct);
            return key;
        }
        catch (AmazonS3Exception ex)
        {
            throw new StorageException("Failed to upload file to storage.", ex);
        }
    }

    public Task<string> GetDownloadUrlAsync(string key, TimeSpan expiry)
    {
        var request = new GetPreSignedUrlRequest
        {
            BucketName = _bucketName,
            Key = key,
            Expires = DateTime.UtcNow.Add(expiry),
            Verb = HttpVerb.GET,
            Protocol = _urlProtocol
        };

        var url = s3Client.GetPreSignedURL(request);
        return Task.FromResult(url);
    }
}
