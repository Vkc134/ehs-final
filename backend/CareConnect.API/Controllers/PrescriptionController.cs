using CareConnect.Core.Common;
using CareConnect.Core.DTOs;
using CareConnect.Core.Entities;
using CareConnect.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CareConnect.API.Controllers
{
    [Route("api/prescriptions")]
    [ApiController]
    [Authorize]
    public class PrescriptionController : ControllerBase
    {
        private readonly IUnitOfWork _uow;

        public PrescriptionController(IUnitOfWork uow) => _uow = uow;

        [HttpGet]
        [Authorize(Roles = "Doctor,Pharmacist")]
        [ProducesResponseType(typeof(ApiResponse<IEnumerable<PrescriptionDto>>), 200)]
        public async Task<IActionResult> GetPrescriptions()
        {
            var prescriptions = await _uow.Prescriptions.GetAllDtosAsync();
            return Ok(ApiResponse<IEnumerable<PrescriptionDto>>.Ok(prescriptions));
        }

        [HttpPost]
        [Authorize(Roles = "Doctor")]
        [ProducesResponseType(typeof(ApiResponse), 201)]
        [ProducesResponseType(typeof(ApiResponse), 400)]
        [ProducesResponseType(typeof(ApiResponse), 404)]
        public async Task<IActionResult> CreatePrescription([FromBody] CreatePrescriptionDto dto)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage).ToList();
                return BadRequest(ApiResponse.Fail("Validation failed.", errors));
            }

            await _uow.BeginTransactionAsync();

            var prescription = new Prescription
            {
                VisitId = dto.VisitId,
                Notes = dto.Notes,
                AttachmentPath = dto.AttachmentPath,
                IsSigned = false,
                IsDispensed = false,
                CreatedAt = DateTime.UtcNow
            };

            await _uow.Prescriptions.AddAsync(prescription);
            await _uow.SaveChangesAsync();

            var visit = await _uow.Visits.GetByIdAsync(dto.VisitId);
            if (visit == null)
            {
                await _uow.RollbackAsync();
                return NotFound(ApiResponse.Fail($"Visit {dto.VisitId} not found."));
            }

            visit.Complaints = dto.ChiefComplaints;
            visit.Diagnosis = dto.Diagnosis;
            visit.Tests = dto.LabInvestigations;
            visit.Advice = dto.Notes;
            _uow.Visits.Update(visit);

            if (dto.Medicines != null && dto.Medicines.Count > 0)
            {
                var medicines = dto.Medicines.Select(m => new Medicine
                {
                    PrescriptionId = prescription.PrescriptionId,
                    Name = m.Name,
                    Dosage = m.Dosage,
                    Frequency = m.Frequency,
                    Duration = m.Duration
                }).ToList();

                medicines.ForEach(m => prescription.Medicines.Add(m));
            }

            await _uow.SaveChangesAsync();
            await _uow.CommitAsync();

            return StatusCode(201, ApiResponse.Ok("Prescription created successfully."));
        }

        [HttpPatch("{id}/sign-off")]
        [Authorize(Roles = "Doctor")]
        [ProducesResponseType(typeof(ApiResponse), 200)]
        [ProducesResponseType(typeof(ApiResponse), 404)]
        public async Task<IActionResult> SignOff(int id)
        {
            await _uow.BeginTransactionAsync();

            var prescription = await _uow.Prescriptions.GetByIdAsync(id);
            if (prescription == null)
            {
                await _uow.RollbackAsync();
                return NotFound(ApiResponse.Fail($"Prescription {id} not found."));
            }

            prescription.IsSigned = true;
            _uow.Prescriptions.Update(prescription);

            var visit = await _uow.Visits.GetByIdAsync(prescription.VisitId);
            if (visit != null)
            {
                visit.Status = "Completed";
                _uow.Visits.Update(visit);
            }

            await _uow.SaveChangesAsync();
            await _uow.CommitAsync();

            return Ok(ApiResponse.Ok("Prescription signed off successfully."));
        }

        [HttpPatch("{id}/dispense")]
        [Authorize(Roles = "Pharmacist")]
        [ProducesResponseType(typeof(ApiResponse), 200)]
        [ProducesResponseType(typeof(ApiResponse), 404)]
        public async Task<IActionResult> Dispense(int id)
        {
            var prescription = await _uow.Prescriptions.GetByIdAsync(id);
            if (prescription == null)
                return NotFound(ApiResponse.Fail($"Prescription {id} not found."));

            prescription.IsDispensed = true;
            _uow.Prescriptions.Update(prescription);
            await _uow.SaveChangesAsync();

            return Ok(ApiResponse.Ok("Prescription dispensed successfully."));
        }
    }
}
