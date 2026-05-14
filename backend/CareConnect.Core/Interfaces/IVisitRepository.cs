using CareConnect.Core.DTOs;
using CareConnect.Core.Entities;

namespace CareConnect.Core.Interfaces
{
    public interface IVisitRepository : IRepository<Visit>
    {
        Task<IEnumerable<VisitDto>> GetFilteredDtosAsync(string? doctorName, int? patientId);
    }
}
