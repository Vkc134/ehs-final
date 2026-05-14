namespace CareConnect.Core.Interfaces
{
    public interface IUnitOfWork : IDisposable
    {
        IPatientRepository Patients { get; }
        IVisitRepository Visits { get; }
        IPrescriptionRepository Prescriptions { get; }
        IVitalsRepository Vitals { get; }

        Task<int> SaveChangesAsync();
        Task BeginTransactionAsync();
        Task CommitAsync();
        Task RollbackAsync();
    }
}
