namespace MIMS.Application.DataSources.Queries.GetRecentDataSources;

public record RecentDataSourceDto(
    string DataSourceName,
    DateTime UploadDate,
    long FileSize,
    string DownloadUrl);
