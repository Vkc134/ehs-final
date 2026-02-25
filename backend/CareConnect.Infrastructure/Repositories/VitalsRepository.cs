using CareConnect.Core.DTOs;
using CareConnect.Core.Entities;
using CareConnect.Core.Interfaces;
using CareConnect.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace CareConnect.Infrastructure.Repositories
{
    public class VitalsRepository : IVitalsRepository
    {
        private readonly ApplicationDbContext _context;

        public VitalsRepository(ApplicationDbContext context) => _context = context;

        public async Task<Vitals?> GetByIdAsync(int id) => await _context.Vitals.FindAsync(id);

        public async Task<IEnumerable<Vitals>> GetAllAsync() => await _context.Vitals.ToListAsync();

        public async Task<IEnumerable<Vitals>> FindAsync(Expression<Func<Vitals, bool>> predicate) =>
            await _context.Vitals.Where(predicate).ToListAsync();

        public async Task AddAsync(Vitals entity) => await _context.Vitals.AddAsync(entity);

        public void Update(Vitals entity) => _context.Vitals.Update(entity);

        public void Remove(Vitals entity) => _context.Vitals.Remove(entity);

        public async Task<VitalsDto?> GetByVisitIdAsync(int visitId)
        {
            var vitals = await _context.Vitals.FirstOrDefaultAsync(v => v.VisitId == visitId);
            if (vitals == null) return null;

            return new VitalsDto
            {
                VitalsId = vitals.VitalsId,
                VisitId = vitals.VisitId,
                BloodPressure = vitals.BloodPressure,
                Pulse = vitals.Pulse,
                Temperature = vitals.Temperature,
                SpO2 = vitals.SpO2,
                Weight = vitals.Weight,
                Height = vitals.Height,
                BMI = vitals.BMI
            };
        }
    }
}
