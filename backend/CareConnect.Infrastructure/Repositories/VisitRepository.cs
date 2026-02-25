using CareConnect.Core.DTOs;
using CareConnect.Core.Entities;
using CareConnect.Core.Interfaces;
using CareConnect.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace CareConnect.Infrastructure.Repositories
{
    public class VisitRepository : IVisitRepository
    {
        private readonly ApplicationDbContext _context;

        public VisitRepository(ApplicationDbContext context) => _context = context;

        public async Task<Visit?> GetByIdAsync(int id) => await _context.Visits.FindAsync(id);

        public async Task<IEnumerable<Visit>> GetAllAsync() => await _context.Visits.ToListAsync();

        public async Task<IEnumerable<Visit>> FindAsync(Expression<Func<Visit, bool>> predicate) =>
            await _context.Visits.Where(predicate).ToListAsync();

        public async Task AddAsync(Visit entity) => await _context.Visits.AddAsync(entity);

        public void Update(Visit entity) => _context.Visits.Update(entity);

        public void Remove(Visit entity) => _context.Visits.Remove(entity);

        public async Task<IEnumerable<VisitDto>> GetFilteredDtosAsync(string? doctorName, int? patientId)
        {
            var query = _context.Visits.AsQueryable();

            if (!string.IsNullOrEmpty(doctorName))
                query = query.Where(v => v.ConsultantDoctorName == doctorName);

            if (patientId.HasValue)
                query = query.Where(v => v.PatientId == patientId.Value);

            return await query
                .Include(v => v.Patient)
                .Include(v => v.Vitals)
                .Include(v => v.Prescription)
                    .ThenInclude(p => p!.Medicines)
                .OrderByDescending(v => v.CreatedAt)
                .Select(v => new VisitDto
                {
                    VisitId = v.VisitId,
                    PatientId = v.PatientId,
                    PatientName = v.Patient!.PatientFirstName + " " + v.Patient.PatientLastName,
                    ConsultantDoctorName = v.ConsultantDoctorName,
                    Priority = v.Priority,
                    Status = v.Status,
                    CreatedAt = v.CreatedAt,
                    AttachmentPath = v.AttachmentPath,
                    Complaints = v.Complaints,
                    Diagnosis = v.Diagnosis,
                    Advice = v.Advice,
                    Tests = v.Tests,
                    Vitals = v.Vitals != null ? new VitalsDto
                    {
                        VitalsId = v.Vitals.VitalsId,
                        VisitId = v.Vitals.VisitId,
                        BloodPressure = v.Vitals.BloodPressure,
                        Pulse = v.Vitals.Pulse,
                        Temperature = v.Vitals.Temperature,
                        SpO2 = v.Vitals.SpO2,
                        Weight = v.Vitals.Weight,
                        Height = v.Vitals.Height,
                        BMI = v.Vitals.BMI
                    } : null,
                    Medicines = v.Prescription != null
                        ? v.Prescription.Medicines.Select(m => new MedicineDto
                        {
                            Name = m.Name,
                            Dosage = m.Dosage,
                            Frequency = m.Frequency,
                            Duration = m.Duration
                        }).ToList()
                        : new List<MedicineDto>()
                })
                .ToListAsync();
        }
    }
}
