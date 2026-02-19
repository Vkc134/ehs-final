using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace CareConnect.API.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreateSqLite : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Patients",
                columns: table => new
                {
                    PatientId = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    PatientFirstName = table.Column<string>(type: "TEXT", nullable: false),
                    PatientLastName = table.Column<string>(type: "TEXT", nullable: false),
                    DateOfBirth = table.Column<DateTime>(type: "TEXT", nullable: false),
                    Gender = table.Column<string>(type: "TEXT", nullable: false),
                    PhoneNumber = table.Column<string>(type: "TEXT", nullable: false),
                    Email = table.Column<string>(type: "TEXT", nullable: false),
                    Address = table.Column<string>(type: "TEXT", nullable: false),
                    Prescription = table.Column<string>(type: "TEXT", nullable: false),
                    BloodGroup = table.Column<string>(type: "TEXT", nullable: false),
                    IsVyasa = table.Column<bool>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Patients", x => x.PatientId);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Email = table.Column<string>(type: "TEXT", nullable: false),
                    Name = table.Column<string>(type: "TEXT", nullable: false),
                    Credentials = table.Column<string>(type: "TEXT", nullable: false),
                    PasswordHash = table.Column<string>(type: "TEXT", nullable: false),
                    Role = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Visits",
                columns: table => new
                {
                    VisitId = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    PatientId = table.Column<int>(type: "INTEGER", nullable: false),
                    ConsultantDoctorName = table.Column<string>(type: "TEXT", nullable: false),
                    Priority = table.Column<string>(type: "TEXT", nullable: false),
                    Status = table.Column<string>(type: "TEXT", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
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
                    PrescriptionId = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    VisitId = table.Column<int>(type: "INTEGER", nullable: false),
                    Notes = table.Column<string>(type: "TEXT", nullable: false),
                    IsSigned = table.Column<bool>(type: "INTEGER", nullable: false),
                    IsDispensed = table.Column<bool>(type: "INTEGER", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
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
                    VitalsId = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    VisitId = table.Column<int>(type: "INTEGER", nullable: false),
                    BloodPressure = table.Column<string>(type: "TEXT", nullable: false),
                    Pulse = table.Column<string>(type: "TEXT", nullable: false),
                    Temperature = table.Column<string>(type: "TEXT", nullable: false),
                    SpO2 = table.Column<string>(type: "TEXT", nullable: false),
                    Weight = table.Column<string>(type: "TEXT", nullable: false)
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
                    MedicineId = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    PrescriptionId = table.Column<int>(type: "INTEGER", nullable: false),
                    Name = table.Column<string>(type: "TEXT", nullable: false),
                    Dosage = table.Column<string>(type: "TEXT", nullable: false),
                    Frequency = table.Column<string>(type: "TEXT", nullable: false),
                    Duration = table.Column<string>(type: "TEXT", nullable: false)
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
                table: "Patients",
                columns: new[] { "PatientId", "Address", "BloodGroup", "DateOfBirth", "Email", "Gender", "IsVyasa", "PatientFirstName", "PatientLastName", "PhoneNumber", "Prescription" },
                values: new object[] { 1, "", "O+", new DateTime(1985, 5, 20, 0, 0, 0, 0, DateTimeKind.Unspecified), "john.doe@example.com", "Male", false, "John", "Doe", "1234567890", "" });

            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "Credentials", "Email", "Name", "PasswordHash", "Role" },
                values: new object[,]
                {
                    { 2, "RN", "nurse@hospital.com", "Nurse Joy", "$2a$11$dcbh.BB2pIEKXPNX2qdU6u17TFgnsFg4ZLdi3FhGT5mk3cY4cqNW.", "Nurse" },
                    { 3, "B.Pharm", "pharmacist@hospital.com", "Pharma Bob", "$2a$11$dcbh.BB2pIEKXPNX2qdU6u17TFgnsFg4ZLdi3FhGT5mk3cY4cqNW.", "Pharmacist" },
                    { 4, "Psychiatrist MBBS, D.P.M (Osm)", "vasista@careconnect.com", "Dr. BSG VASISTA", "$2a$11$gdCr.jAXM2JaZa/nuRXclOMnMTsbkkA/G2CLZboN.JmADqVMLhffC", "Doctor" }
                });

            migrationBuilder.InsertData(
                table: "Visits",
                columns: new[] { "VisitId", "ConsultantDoctorName", "CreatedAt", "PatientId", "Priority", "Status" },
                values: new object[,]
                {
                    { 1, "Dr. Smith", new DateTime(2026, 2, 5, 4, 33, 15, 761, DateTimeKind.Utc).AddTicks(7400), 1, "Normal", "Vitals Recorded" },
                    { 2, "Dr. Smith", new DateTime(2026, 2, 5, 3, 33, 15, 761, DateTimeKind.Utc).AddTicks(7400), 1, "Normal", "Completed" }
                });

            migrationBuilder.InsertData(
                table: "Prescriptions",
                columns: new[] { "PrescriptionId", "CreatedAt", "IsDispensed", "IsSigned", "Notes", "VisitId" },
                values: new object[] { 1, new DateTime(2026, 2, 5, 4, 3, 15, 761, DateTimeKind.Utc).AddTicks(7440), false, true, "Take rest and drink water.", 2 });

            migrationBuilder.InsertData(
                table: "Vitals",
                columns: new[] { "VitalsId", "BloodPressure", "Pulse", "SpO2", "Temperature", "VisitId", "Weight" },
                values: new object[] { 1, "120/80", "72", "98", "98.6", 1, "70" });

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
                name: "Medicines");

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
