using Amazon.S3;
using Amazon.S3.Model;
using Microsoft.Extensions.Configuration;
using MIMS.Application.Common.Exceptions;
using MIMS.Application.Common.Interfaces;

namespace MIMS.Infrastructure.Storage;

public class S3FileStorageService(IAmazonS3 s3Client, IConfiguration configuration) : IFileStorageService
{
    private readonly string _bucketName = configuration["S3:BucketName"] ?? "mims-data-sources";

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
}
