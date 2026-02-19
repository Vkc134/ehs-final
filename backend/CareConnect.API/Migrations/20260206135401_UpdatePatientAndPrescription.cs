using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CareConnect.API.Migrations
{
    /// <inheritdoc />
    public partial class UpdatePatientAndPrescription : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AttachmentPath",
                table: "Prescriptions",
                type: "TEXT",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "Prescriptions",
                keyColumn: "PrescriptionId",
                keyValue: 1,
                columns: new[] { "AttachmentPath", "CreatedAt" },
                values: new object[] { null, new DateTime(2026, 2, 6, 13, 24, 1, 518, DateTimeKind.Utc).AddTicks(2340) });

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

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AttachmentPath",
                table: "Prescriptions");

            migrationBuilder.UpdateData(
                table: "Prescriptions",
                keyColumn: "PrescriptionId",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 2, 5, 4, 3, 15, 761, DateTimeKind.Utc).AddTicks(7440));

            migrationBuilder.UpdateData(
                table: "Visits",
                keyColumn: "VisitId",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 2, 5, 4, 33, 15, 761, DateTimeKind.Utc).AddTicks(7400));

            migrationBuilder.UpdateData(
                table: "Visits",
                keyColumn: "VisitId",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2026, 2, 5, 3, 33, 15, 761, DateTimeKind.Utc).AddTicks(7400));
        }
    }
}
