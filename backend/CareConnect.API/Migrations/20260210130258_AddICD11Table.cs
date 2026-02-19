using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CareConnect.API.Migrations
{
    /// <inheritdoc />
    public partial class AddICD11Table : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ICD11Codes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Code = table.Column<string>(type: "TEXT", nullable: false),
                    Description = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ICD11Codes", x => x.Id);
                });

            migrationBuilder.UpdateData(
                table: "Prescriptions",
                keyColumn: "PrescriptionId",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 2, 10, 12, 32, 58, 358, DateTimeKind.Utc).AddTicks(3450));

            migrationBuilder.UpdateData(
                table: "Visits",
                keyColumn: "VisitId",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 2, 10, 13, 2, 58, 358, DateTimeKind.Utc).AddTicks(3420));

            migrationBuilder.UpdateData(
                table: "Visits",
                keyColumn: "VisitId",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2026, 2, 10, 12, 2, 58, 358, DateTimeKind.Utc).AddTicks(3420));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ICD11Codes");

            migrationBuilder.UpdateData(
                table: "Prescriptions",
                keyColumn: "PrescriptionId",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 2, 6, 13, 24, 1, 518, DateTimeKind.Utc).AddTicks(2340));

            migrationBuilder.UpdateData(
                table: "Visits",
                keyColumn: "VisitId",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 2, 6, 13, 54, 1, 518, DateTimeKind.Utc).AddTicks(2310));

            migrationBuilder.UpdateData(
                table: "Visits",
                keyColumn: "VisitId",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2026, 2, 6, 12, 54, 1, 518, DateTimeKind.Utc).AddTicks(2310));
        }
    }
}
