using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace MIMS.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class DataMappingDetailAutoMatch : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("CREATE EXTENSION IF NOT EXISTS pg_textsearch;");

            migrationBuilder.Sql("""
                CREATE INDEX ix_data_source_detail_bm25
                ON data_source_detail
                USING bm25(normalize_column_data)
                WITH (text_config = 'english');
                """);

            migrationBuilder.CreateTable(
                name: "data_mapping_detail",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    data_mapping_id = table.Column<int>(type: "integer", nullable: false),
                    source_data_id = table.Column<int>(type: "integer", nullable: false),
                    target_data_id = table.Column<int>(type: "integer", nullable: true),
                    mapping_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    is_verified = table.Column<bool>(type: "boolean", nullable: false),
                    score = table.Column<double>(type: "double precision", nullable: true),
                    created_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    created_by = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    updated_by = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_data_mapping_detail", x => x.id);
                    table.ForeignKey(
                        name: "FK_data_mapping_detail_data_mapping_data_mapping_id",
                        column: x => x.data_mapping_id,
                        principalTable: "data_mapping",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_data_mapping_detail_data_source_detail_source_data_id",
                        column: x => x.source_data_id,
                        principalTable: "data_source_detail",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_data_mapping_detail_data_source_detail_target_data_id",
                        column: x => x.target_data_id,
                        principalTable: "data_source_detail",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_data_mapping_detail_data_mapping_id",
                table: "data_mapping_detail",
                column: "data_mapping_id");

            migrationBuilder.CreateIndex(
                name: "IX_data_mapping_detail_source_data_id",
                table: "data_mapping_detail",
                column: "source_data_id");

            migrationBuilder.CreateIndex(
                name: "IX_data_mapping_detail_target_data_id",
                table: "data_mapping_detail",
                column: "target_data_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "data_mapping_detail");

            migrationBuilder.Sql("DROP INDEX IF EXISTS ix_data_source_detail_bm25;");

            migrationBuilder.Sql("DROP EXTENSION IF EXISTS pg_textsearch;");
        }
    }
}
