using Microsoft.EntityFrameworkCore;
using Npgsql;
using MIMS.Application.Common.Extensions;
using MIMS.Application.Common.Interfaces;
using MIMS.Application.DataSources.Queries.GetDataSourceDetails;
using MIMS.Application.DataSources.Queries.SearchDataSourceDetails;
using MIMS.Core.Entities;

namespace MIMS.Infrastructure.Persistence;

public class AppDbContext(DbContextOptions<AppDbContext> options)
    : DbContext(options), IApplicationDbContext
{
    public DbSet<DataSource> DataSources => Set<DataSource>();
    public DbSet<DataSourceDetail> DataSourceDetails => Set<DataSourceDetail>();
    public DbSet<DataMapping> DataMappings => Set<DataMapping>();
    public DbSet<DataMappingDetail> DataMappingDetails => Set<DataMappingDetail>();
    public DbSet<Outbox> Outboxes => Set<Outbox>();

    public async Task<(int DetailId, double Score)?> SearchBestTargetAsync(
        string normalizedText,
        int targetDataSourceId,
        CancellationToken cancellationToken = default)
    {
        // pg_textsearch <@> operator requirements:
        //   - column must be text (not varchar) — left operand must be a bare table column
        //   - bm25_get_current_score() retrieves the score during the BM25 index scan
        //   - score is negated because <@> returns a negative distance (lower = more relevant)
        //   - to_bm25query(@text, 'index_name') must be used on the right side so the planner
        //     can resolve the index even when the query text is a parameter ($n), not a literal
        // The score threshold (>= 0.75) is applied in application code after the query.
        // Column aliases must match BestMatchResult property names exactly (case-insensitive)
        // because EF Core SqlQueryRaw<T> maps by column name, not by convention.
        const string sql = """
            SELECT id                        AS "Id",
                   normalize_column_data     AS "NormalizeColumnData",
                   -bm25_get_current_score() AS "Score"
            FROM data_source_detail
            WHERE data_source_id = @targetDataSourceId
            ORDER BY normalize_column_data <@> to_bm25query(@searchText, 'ix_data_source_detail_bm25')
            LIMIT 2
            """;

        var candidates = await Database
            .SqlQueryRaw<BestMatchResult>(
                sql,
                new NpgsqlParameter("searchText", normalizedText),
                new NpgsqlParameter("targetDataSourceId", targetDataSourceId))
            .ToListAsync(cancellationToken);

        // Apply minimum score threshold — discard candidates below 0.75
        const double minScore = 0.75;
        var qualified = candidates.Where(c => c.Score >= minScore).ToList();

        if (qualified.Count == 0)
            return null;

        if (qualified.Count == 1)
            return (qualified[0].Id, qualified[0].Score);

        // Tiebreaker: if top-2 scores are equal, prefer higher word-appearance percentage
        const double epsilon = 1e-9;
        if (Math.Abs(qualified[0].Score - qualified[1].Score) < epsilon)
        {
            var pct0 = normalizedText.CalculateWordAppearancePercentage(qualified[0].NormalizeColumnData);
            var pct1 = normalizedText.CalculateWordAppearancePercentage(qualified[1].NormalizeColumnData);
            var winner = pct0 >= pct1 ? qualified[0] : qualified[1];
            return (winner.Id, winner.Score);
        }

        return (qualified[0].Id, qualified[0].Score);
    }

    public async Task<(List<SearchDataSourceDetailDto> Items, int TotalCount)> SearchDataSourceDetailsAsync(
        int dataSourceId,
        string query,
        int page,
        int pageSize,
        CancellationToken cancellationToken = default)
    {
        // BM25-ranked search using ParadeDB's <@> operator on the existing
        // ix_data_source_detail_bm25 index (on normalize_column_data).
        var offset = (page - 1) * pageSize;

        // <@> returns double precision (a distance/score), not boolean —
        // it can only appear in ORDER BY, never in WHERE.
        // Count all rows for the data source; results are ranked by relevance, not filtered.
        // SqlQueryRaw<int> maps the result by a column named "Value"
        const string countSql = """
            SELECT COUNT(*)::int AS "Value"
            FROM data_source_detail
            WHERE data_source_id = @dataSourceId
            """;

        const string itemsSql = """
            SELECT primary_column_data       AS "Primary",
                   description_column_data   AS "Description",
                   normalize_column_data     AS "Normalized",
                   -bm25_get_current_score() AS "Score"
            FROM data_source_detail
            WHERE data_source_id = @dataSourceId
            ORDER BY normalize_column_data <@> to_bm25query(@query, 'ix_data_source_detail_bm25')
            LIMIT @pageSize OFFSET @offset
            """;

        var totalCount = await Database
            .SqlQueryRaw<int>(
                countSql,
                new NpgsqlParameter("dataSourceId", dataSourceId))
            .FirstAsync(cancellationToken);

        var items = await Database
            .SqlQueryRaw<SearchDataSourceDetailDto>(
                itemsSql,
                new NpgsqlParameter("dataSourceId", dataSourceId),
                new NpgsqlParameter("query", query),
                new NpgsqlParameter("pageSize", pageSize),
                new NpgsqlParameter("offset", offset))
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }

    private sealed class BestMatchResult
    {
        public int Id { get; set; }
        public string NormalizeColumnData { get; set; } = string.Empty;
        public double Score { get; set; }
    }
}
