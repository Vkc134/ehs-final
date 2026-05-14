using CareConnect.Core.DTOs;
using CareConnect.Core.Entities;

namespace CareConnect.Core.Interfaces
{
    public interface IPrescriptionRepository : IRepository<Prescription>
    {
        Task<IEnumerable<PrescriptionDto>> GetAllDtosAsync();
        Task<Prescription?> GetWithMedicinesAsync(int id);
    }
}
