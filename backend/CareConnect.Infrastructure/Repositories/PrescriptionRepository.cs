using CareConnect.Core.DTOs;
using CareConnect.Core.Entities;
using CareConnect.Core.Interfaces;
using CareConnect.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace CareConnect.Infrastructure.Repositories
{
    public class PrescriptionRepository : IPrescriptionRepository
    {
        private readonly ApplicationDbContext _context;

        public PrescriptionRepository(ApplicationDbContext context) => _context = context;

        public async Task<Prescription?> GetByIdAsync(int id) => await _context.Prescriptions.FindAsync(id);

        public async Task<IEnumerable<Prescription>> GetAllAsync() => await _context.Prescriptions.ToListAsync();

        public async Task<IEnumerable<Prescription>> FindAsync(Expression<Func<Prescription, bool>> predicate) =>
            await _context.Prescriptions.Where(predicate).ToListAsync();

        public async Task AddAsync(Prescription entity) => await _context.Prescriptions.AddAsync(entity);

        public void Update(Prescription entity) => _context.Prescriptions.Update(entity);

        public void Remove(Prescription entity) => _context.Prescriptions.Remove(entity);

        public async Task<Prescription?> GetWithMedicinesAsync(int id) =>
            await _context.Prescriptions
                .Include(p => p.Medicines)
                .FirstOrDefaultAsync(p => p.PrescriptionId == id);

        public async Task<IEnumerable<PrescriptionDto>> GetAllDtosAsync() =>
            await _context.Prescriptions
                .Include(p => p.Medicines)
                .Include(p => p.Visit)
                    .ThenInclude(v => v!.Patient)
                .OrderByDescending(p => p.CreatedAt)
                .Select(p => new PrescriptionDto
                {
                    PrescriptionId = p.PrescriptionId,
                    VisitId = p.VisitId,
                    Notes = p.Notes,
                    AttachmentPath = p.AttachmentPath,
                    IsSigned = p.IsSigned,
                    IsDispensed = p.IsDispensed,
                    CreatedAt = p.CreatedAt,
                    Medicines = p.Medicines.Select(m => new MedicineDto
                    {
                        Name = m.Name,
                        Dosage = m.Dosage,
                        Frequency = m.Frequency,
                        Duration = m.Duration
                    }).ToList(),
                    Visit = new PrescriptionVisitDto
                    {
                        PatientId = p.Visit != null ? p.Visit.PatientId : 0,
                        PatientFirstName = p.Visit != null && p.Visit.Patient != null ? p.Visit.Patient.PatientFirstName : "N/A",
                        PatientLastName = p.Visit != null && p.Visit.Patient != null ? p.Visit.Patient.PatientLastName : "N/A",
                        Gender = p.Visit != null && p.Visit.Patient != null ? p.Visit.Patient.Gender : "N/A",
                        PatientAge = p.Visit != null && p.Visit.Patient != null ? (DateTime.UtcNow.Year - p.Visit.Patient.DateOfBirth.Year).ToString() : "N/A",
                        PatientAddress = p.Visit != null && p.Visit.Patient != null ? p.Visit.Patient.Address : "N/A",
                        PatientPhone = p.Visit != null && p.Visit.Patient != null ? p.Visit.Patient.PhoneNumber : "N/A",
                        ConsultantDoctorName = p.Visit != null ? p.Visit.ConsultantDoctorName : "N/A"
                    }
                })
                .ToListAsync();
    }
}
