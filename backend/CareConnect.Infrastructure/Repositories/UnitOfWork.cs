using CareConnect.Core.Interfaces;
using CareConnect.Infrastructure.Data;
using CareConnect.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore.Storage;

namespace CareConnect.Infrastructure.Repositories
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly ApplicationDbContext _context;
        private IDbContextTransaction? _transaction;

        private IPatientRepository? _patients;
        private IVisitRepository? _visits;
        private IPrescriptionRepository? _prescriptions;
        private IVitalsRepository? _vitals;

        public UnitOfWork(ApplicationDbContext context) => _context = context;

        public IPatientRepository Patients => _patients ??= new PatientRepository(_context);
        public IVisitRepository Visits => _visits ??= new VisitRepository(_context);
        public IPrescriptionRepository Prescriptions => _prescriptions ??= new PrescriptionRepository(_context);
        public IVitalsRepository Vitals => _vitals ??= new VitalsRepository(_context);

        public async Task<int> SaveChangesAsync() => await _context.SaveChangesAsync();

        public async Task BeginTransactionAsync() =>
            _transaction = await _context.Database.BeginTransactionAsync();

        public async Task CommitAsync()
        {
            if (_transaction != null)
            {
                await _transaction.CommitAsync();
                await _transaction.DisposeAsync();
                _transaction = null;
            }
        }

        public async Task RollbackAsync()
        {
            if (_transaction != null)
            {
                await _transaction.RollbackAsync();
                await _transaction.DisposeAsync();
                _transaction = null;
            }
        }

        public void Dispose()
        {
            _transaction?.Dispose();
            _context.Dispose();
        }
    }
}
