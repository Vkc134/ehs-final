using CareConnect.Core.DTOs;
using CareConnect.Core.Entities;
using CareConnect.Core.Interfaces;
using CareConnect.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace CareConnect.Infrastructure.Repositories
{
    public class PatientRepository : IPatientRepository
    {
        private readonly ApplicationDbContext _context;

        public PatientRepository(ApplicationDbContext context) => _context = context;

        public async Task<Patient?> GetByIdAsync(int id) => await _context.Patients.FindAsync(id);

        public async Task<IEnumerable<Patient>> GetAllAsync() => await _context.Patients.ToListAsync();

        public async Task<IEnumerable<Patient>> FindAsync(Expression<Func<Patient, bool>> predicate) =>
            await _context.Patients.Where(predicate).ToListAsync();

        public async Task AddAsync(Patient entity) => await _context.Patients.AddAsync(entity);

        public void Update(Patient entity) => _context.Patients.Update(entity);

        public void Remove(Patient entity) => _context.Patients.Remove(entity);

        public async Task<IEnumerable<PatientDto>> GetAllDtosAsync() =>
            await _context.Patients.Select(p => new PatientDto
            {
                PatientId = p.PatientId,
                PatientFirstName = p.PatientFirstName,
                PatientLastName = p.PatientLastName,
                DateOfBirth = p.DateOfBirth,
                Gender = p.Gender,
                PhoneNumber = p.PhoneNumber,
                Email = p.Email,
                Address = p.Address,
                Prescription = p.Prescription,
                BloodGroup = p.BloodGroup,
                IsVyasa = p.IsVyasa
            }).ToListAsync();

        public async Task<PatientDto?> GetDtoByIdAsync(int id) =>
            await _context.Patients
                .Where(p => p.PatientId == id)
                .Select(p => new PatientDto
                {
                    PatientId = p.PatientId,
                    PatientFirstName = p.PatientFirstName,
                    PatientLastName = p.PatientLastName,
                    DateOfBirth = p.DateOfBirth,
                    Gender = p.Gender,
                    PhoneNumber = p.PhoneNumber,
                    Email = p.Email,
                    Address = p.Address,
                    Prescription = p.Prescription,
                    BloodGroup = p.BloodGroup,
                    IsVyasa = p.IsVyasa
                }).FirstOrDefaultAsync();
    }
}
