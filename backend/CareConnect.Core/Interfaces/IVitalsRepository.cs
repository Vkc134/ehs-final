using CareConnect.Core.DTOs;
using CareConnect.Core.Entities;

namespace CareConnect.Core.Interfaces
{
    public interface IVitalsRepository : IRepository<Vitals>
    {
        Task<VitalsDto?> GetByVisitIdAsync(int visitId);
    }
}
