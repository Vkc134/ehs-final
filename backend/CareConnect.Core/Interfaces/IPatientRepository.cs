using CareConnect.Core.DTOs;
using CareConnect.Core.Entities;

namespace CareConnect.Core.Interfaces
{
    public interface IPatientRepository : IRepository<Patient>
    {
        Task<IEnumerable<PatientDto>> GetAllDtosAsync();
        Task<PatientDto?> GetDtoByIdAsync(int id);
    }
}
