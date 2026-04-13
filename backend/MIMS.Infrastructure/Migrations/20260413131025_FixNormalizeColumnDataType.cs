using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MIMS.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class FixNormalizeColumnDataType : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // BM25 index must be dropped before altering the column type, then recreated.
            migrationBuilder.Sql("DROP INDEX IF EXISTS ix_data_source_detail_bm25;");

            migrationBuilder.AlterColumn<string>(
                name: "normalize_column_data",
                table: "data_source_detail",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(2000)",
                oldMaxLength: 2000);

            migrationBuilder.Sql("""
                CREATE INDEX ix_data_source_detail_bm25
                ON data_source_detail
                USING bm25(normalize_column_data)
                WITH (text_config = 'english');
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DROP INDEX IF EXISTS ix_data_source_detail_bm25;");

            migrationBuilder.AlterColumn<string>(
                name: "normalize_column_data",
                table: "data_source_detail",
                type: "character varying(2000)",
                maxLength: 2000,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.Sql("""
                CREATE INDEX ix_data_source_detail_bm25
                ON data_source_detail
                USING bm25(normalize_column_data)
                WITH (text_config = 'english');
                """);
        }
    }
}
