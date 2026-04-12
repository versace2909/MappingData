using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MIMS.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddDataSourceTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "data_source",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    data_source_name = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    created_by = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    file_name = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    file_size = table.Column<long>(type: "bigint", nullable: false),
                    file_extension = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    created_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_by = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    updated_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_data_source", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "data_source_detail",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    data_source_id = table.Column<Guid>(type: "uuid", nullable: false),
                    primary_column_data = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    description_column_data = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    normalize_column_data = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    created_by = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    updated_by = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    created_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_data_source_detail", x => x.id);
                    table.ForeignKey(
                        name: "FK_data_source_detail_data_source_data_source_id",
                        column: x => x.data_source_id,
                        principalTable: "data_source",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_data_source_detail_data_source_id",
                table: "data_source_detail",
                column: "data_source_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "data_source_detail");

            migrationBuilder.DropTable(
                name: "data_source");
        }
    }
}
