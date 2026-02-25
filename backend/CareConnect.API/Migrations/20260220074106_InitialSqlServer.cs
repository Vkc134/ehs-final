using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace CareConnect.API.Migrations
{
    /// <inheritdoc />
    public partial class InitialSqlServer : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Drugs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DefaultDosage = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DefaultFrequency = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DefaultDuration = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Drugs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ICD11Codes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Code = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ICD11Codes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Patients",
                columns: table => new
                {
                    PatientId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PatientFirstName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PatientLastName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DateOfBirth = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Gender = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PhoneNumber = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Address = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Prescription = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    BloodGroup = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsVyasa = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Patients", x => x.PatientId);
                });

            migrationBuilder.CreateTable(
                name: "TechTalkRegistrations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FullName = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Phone = table.Column<string>(type: "nvarchar(15)", maxLength: 15, nullable: false),
                    College = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    YearOfStudy = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    PptTopic = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    ReferredBy = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    PptFilePath = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    PptOriginalName = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    RegisteredAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TechTalkRegistrations", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "TechTalkSettings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MaxCapacity = table.Column<int>(type: "int", nullable: false),
                    IsOpen = table.Column<bool>(type: "bit", nullable: false),
                    LastExtendedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastExtensionAmount = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TechTalkSettings", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Credentials = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Role = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Visits",
                columns: table => new
                {
                    VisitId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PatientId = table.Column<int>(type: "int", nullable: false),
                    ConsultantDoctorName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Priority = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    AttachmentPath = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Complaints = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Diagnosis = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Advice = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Tests = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Visits", x => x.VisitId);
                    table.ForeignKey(
                        name: "FK_Visits_Patients_PatientId",
                        column: x => x.PatientId,
                        principalTable: "Patients",
                        principalColumn: "PatientId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Prescriptions",
                columns: table => new
                {
                    PrescriptionId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    VisitId = table.Column<int>(type: "int", nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AttachmentPath = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsSigned = table.Column<bool>(type: "bit", nullable: false),
                    IsDispensed = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Prescriptions", x => x.PrescriptionId);
                    table.ForeignKey(
                        name: "FK_Prescriptions_Visits_VisitId",
                        column: x => x.VisitId,
                        principalTable: "Visits",
                        principalColumn: "VisitId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Vitals",
                columns: table => new
                {
                    VitalsId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    VisitId = table.Column<int>(type: "int", nullable: false),
                    BloodPressure = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Pulse = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Temperature = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SpO2 = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Weight = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Height = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    BMI = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Vitals", x => x.VitalsId);
                    table.ForeignKey(
                        name: "FK_Vitals_Visits_VisitId",
                        column: x => x.VisitId,
                        principalTable: "Visits",
                        principalColumn: "VisitId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Medicines",
                columns: table => new
                {
                    MedicineId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PrescriptionId = table.Column<int>(type: "int", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Dosage = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Frequency = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Duration = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Medicines", x => x.MedicineId);
                    table.ForeignKey(
                        name: "FK_Medicines_Prescriptions_PrescriptionId",
                        column: x => x.PrescriptionId,
                        principalTable: "Prescriptions",
                        principalColumn: "PrescriptionId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "Drugs",
                columns: new[] { "Id", "DefaultDosage", "DefaultDuration", "DefaultFrequency", "Name" },
                values: new object[,]
                {
                    { 1, "500mg", null, "1-0-1", "Paracetamol 500mg" },
                    { 2, "500mg", null, "1-0-1", "Amoxicillin 500mg" },
                    { 3, "400mg", null, "1-0-1", "Ibuprofen 400mg" },
                    { 4, "10mg", null, "0-0-1", "Cetirizine 10mg" },
                    { 5, "40mg", null, "1-0-0", "Pantoprazole 40mg" },
                    { 6, "500mg", null, "1-0-0", "Azithromycin 500mg" }
                });

            migrationBuilder.InsertData(
                table: "Patients",
                columns: new[] { "PatientId", "Address", "BloodGroup", "DateOfBirth", "Email", "Gender", "IsVyasa", "PatientFirstName", "PatientLastName", "PhoneNumber", "Prescription" },
                values: new object[] { 1, "", "O+", new DateTime(1985, 5, 20, 0, 0, 0, 0, DateTimeKind.Unspecified), "john.doe@example.com", "Male", false, "John", "Doe", "1234567890", "" });

            migrationBuilder.InsertData(
                table: "TechTalkSettings",
                columns: new[] { "Id", "IsOpen", "LastExtendedAt", "LastExtensionAmount", "MaxCapacity" },
                values: new object[] { 1, true, null, 0, 50 });

            migrationBuilder.InsertData(
                table: "Visits",
                columns: new[] { "VisitId", "Advice", "AttachmentPath", "Complaints", "ConsultantDoctorName", "CreatedAt", "Diagnosis", "PatientId", "Priority", "Status", "Tests" },
                values: new object[,]
                {
                    { 1, "", null, "[]", "Dr. Smith", new DateTime(2026, 2, 20, 7, 41, 6, 319, DateTimeKind.Utc).AddTicks(2640), "[]", 1, "Normal", "Vitals Recorded", "[]" },
                    { 2, "", null, "[]", "Dr. Smith", new DateTime(2026, 2, 20, 6, 41, 6, 319, DateTimeKind.Utc).AddTicks(2640), "[]", 1, "Normal", "Completed", "[]" }
                });

            migrationBuilder.InsertData(
                table: "Prescriptions",
                columns: new[] { "PrescriptionId", "AttachmentPath", "CreatedAt", "IsDispensed", "IsSigned", "Notes", "VisitId" },
                values: new object[] { 1, null, new DateTime(2026, 2, 20, 7, 11, 6, 319, DateTimeKind.Utc).AddTicks(2680), false, true, "Take rest and drink water.", 2 });

            migrationBuilder.InsertData(
                table: "Vitals",
                columns: new[] { "VitalsId", "BMI", "BloodPressure", "Height", "Pulse", "SpO2", "Temperature", "VisitId", "Weight" },
                values: new object[] { 1, "", "120/80", "", "72", "98", "98.6", 1, "70" });

            migrationBuilder.InsertData(
                table: "Medicines",
                columns: new[] { "MedicineId", "Dosage", "Duration", "Frequency", "Name", "PrescriptionId" },
                values: new object[,]
                {
                    { 1, "500mg", "3 Days", "1-0-1 (After food)", "Paracetamol", 1 },
                    { 2, "100mg", "5 Days", "0-1-0 (After food)", "Vitamin C", 1 }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Medicines_PrescriptionId",
                table: "Medicines",
                column: "PrescriptionId");

            migrationBuilder.CreateIndex(
                name: "IX_Prescriptions_VisitId",
                table: "Prescriptions",
                column: "VisitId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Visits_PatientId",
                table: "Visits",
                column: "PatientId");

            migrationBuilder.CreateIndex(
                name: "IX_Vitals_VisitId",
                table: "Vitals",
                column: "VisitId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Drugs");

            migrationBuilder.DropTable(
                name: "ICD11Codes");

            migrationBuilder.DropTable(
                name: "Medicines");

            migrationBuilder.DropTable(
                name: "TechTalkRegistrations");

            migrationBuilder.DropTable(
                name: "TechTalkSettings");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropTable(
                name: "Vitals");

            migrationBuilder.DropTable(
                name: "Prescriptions");

            migrationBuilder.DropTable(
                name: "Visits");

            migrationBuilder.DropTable(
                name: "Patients");
        }
    }
}
