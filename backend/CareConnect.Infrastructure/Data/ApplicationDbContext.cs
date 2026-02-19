using CareConnect.Core.Entities;
using Microsoft.EntityFrameworkCore;

namespace CareConnect.Infrastructure.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Patient> Patients { get; set; }
        public DbSet<Visit> Visits { get; set; }
        public DbSet<Vitals> Vitals { get; set; }
        public DbSet<Prescription> Prescriptions { get; set; }
        public DbSet<Medicine> Medicines { get; set; }
        public DbSet<ICD11Code> ICD11Codes { get; set; }
        public DbSet<Drug> Drugs { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Seed Users (Pass: password)
            // Note: In real app, use BCrypt output. Here using placeholder hash that matches the AuthService verification.
            // $2a$11$Z.9... is roughly "password" in BCrypt default
            modelBuilder.Entity<User>().HasData(
                new User { Id = 2, Email = "nurse@hospital.com", Name = "Nurse Joy", Credentials = "RN", PasswordHash = "$2a$11$dcbh.BB2pIEKXPNX2qdU6u17TFgnsFg4ZLdi3FhGT5mk3cY4cqNW.", Role = "Nurse" },
                new User { Id = 3, Email = "pharmacist@hospital.com", Name = "Pharma Bob", Credentials = "B.Pharm", PasswordHash = "$2a$11$dcbh.BB2pIEKXPNX2qdU6u17TFgnsFg4ZLdi3FhGT5mk3cY4cqNW.", Role = "Pharmacist" },
                new User { Id = 4, Email = "vasista@careconnect.com", Name = "Dr. BSG VASISTA", Credentials = "Psychiatrist MBBS, D.P.M (Osm)", PasswordHash = "$2a$11$gdCr.jAXM2JaZa/nuRXclOMnMTsbkkA/G2CLZboN.JmADqVMLhffC", Role = "Doctor" }
            );

            // Seed Patient
            modelBuilder.Entity<Patient>().HasData(
                new Patient 
                { 
                    PatientId = 1, 
                    PatientFirstName = "John", 
                    PatientLastName = "Doe", 
                    DateOfBirth = new DateTime(1985, 5, 20), 
                    Gender = "Male", 
                    Email = "john.doe@example.com", 
                    BloodGroup = "O+", 
                    IsVyasa = false, 
                    PhoneNumber = "1234567890" 
                }
            );

            // Seed Visit 1 (Ready for Doctor)
            modelBuilder.Entity<Visit>().HasData(
                new Visit 
                { 
                    VisitId = 1, 
                    PatientId = 1, 
                    ConsultantDoctorName = "Dr. Smith", 
                    Priority = "Normal", 
                    Status = "Vitals Recorded", 
                    CreatedAt = DateTime.UtcNow 
                },
                // Seed Visit 2 (Completed - For Pharmacy Demo)
                new Visit 
                { 
                    VisitId = 2, 
                    PatientId = 1, 
                    ConsultantDoctorName = "Dr. Smith", 
                    Priority = "Normal", 
                    Status = "Completed", 
                    CreatedAt = DateTime.UtcNow.AddHours(-1) 
                }
            );

            // Seed Vitals for Visit 1
            modelBuilder.Entity<Vitals>().HasData(
                new Vitals
                {
                    VitalsId = 1,
                    VisitId = 1,
                    BloodPressure = "120/80",
                    Pulse = "72",
                    Temperature = "98.6",
                    SpO2 = "98",
                    Weight = "70"
                }
            );

            // Seed Prescription for Visit 2 (Signed)
            modelBuilder.Entity<Prescription>().HasData(
                new Prescription
                {
                    PrescriptionId = 1,
                    VisitId = 2,
                    Notes = "Take rest and drink water.",
                    IsSigned = true,
                    IsDispensed = false,
                    CreatedAt = DateTime.UtcNow.AddMinutes(-30)
                }
            );

            // Seed Medicine for Prescription 1
            modelBuilder.Entity<Medicine>().HasData(
                new Medicine
                {
                    MedicineId = 1,
                    PrescriptionId = 1,
                    Name = "Paracetamol",
                    Dosage = "500mg",
                    Frequency = "1-0-1 (After food)",
                    Duration = "3 Days"
                },
                new Medicine
                {
                    MedicineId = 2,
                    PrescriptionId = 1,
                    Name = "Vitamin C",
                    Dosage = "100mg",
                    Frequency = "0-1-0 (After food)",
                    Duration = "5 Days"
                }
            );

            // Seed Drugs
            modelBuilder.Entity<Drug>().HasData(
                new Drug { Id = 1, Name = "Paracetamol 500mg", DefaultDosage = "500mg", DefaultFrequency = "1-0-1" },
                new Drug { Id = 2, Name = "Amoxicillin 500mg", DefaultDosage = "500mg", DefaultFrequency = "1-0-1" },
                new Drug { Id = 3, Name = "Ibuprofen 400mg", DefaultDosage = "400mg", DefaultFrequency = "1-0-1" },
                new Drug { Id = 4, Name = "Cetirizine 10mg", DefaultDosage = "10mg", DefaultFrequency = "0-0-1" },
                new Drug { Id = 5, Name = "Pantoprazole 40mg", DefaultDosage = "40mg", DefaultFrequency = "1-0-0" },
                new Drug { Id = 6, Name = "Azithromycin 500mg", DefaultDosage = "500mg", DefaultFrequency = "1-0-0" }
            );
        }
    }
}
