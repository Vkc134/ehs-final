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
        private readonly ILogger<PrescriptionController> _logger;

        public PrescriptionController(IUnitOfWork uow, ILogger<PrescriptionController> logger)
        {
            _uow = uow;
            _logger = logger;
        }

        [HttpGet]
        [Authorize(Roles = "Doctor,Pharmacist")]
        [ProducesResponseType(typeof(ApiResponse<IEnumerable<PrescriptionDto>>), 200)]
        public async Task<IActionResult> GetPrescriptions()
        {
            var prescriptions = await _uow.Prescriptions.GetAllDtosAsync();
            return Ok(prescriptions);
        }

        [HttpPost]
        [Authorize(Roles = "Doctor")]
        [ProducesResponseType(typeof(ApiResponse<object>), 201)]
        [ProducesResponseType(typeof(ApiResponse), 400)]
        [ProducesResponseType(typeof(ApiResponse), 404)]
        [ProducesResponseType(typeof(ApiResponse), 500)]
        public async Task<IActionResult> CreatePrescription([FromBody] CreatePrescriptionDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage).ToList();
                    return BadRequest(ApiResponse.Fail("Validation failed.", errors));
                }

                _logger.LogInformation("Creating prescription for VisitId: {VisitId}", dto.VisitId);

                // 1. Visit existence check (MUST BE FIRST to avoid FK violations)
                var visit = await _uow.Visits.GetByIdAsync(dto.VisitId);
                if (visit == null)
                {
                    _logger.LogWarning("Visit {VisitId} not found.", dto.VisitId);
                    return NotFound(ApiResponse.Fail($"Visit {dto.VisitId} not found."));
                }

                // 2. Duplicate check (to avoid 1-to-1 unique constraint violation)
                var existing = await _uow.Prescriptions.FindAsync(p => p.VisitId == dto.VisitId);
                if (existing.Any())
                {
                    var existingId = existing.First().PrescriptionId;
                    _logger.LogInformation("Prescription already exists for VisitId: {VisitId} (Id: {PrescriptionId})", dto.VisitId, existingId);
                    return Ok(new { id = existingId });
                }

                // 3. Prepare entities
                var prescription = new Prescription
                {
                    VisitId = dto.VisitId,
                    Notes = dto.Notes,
                    AttachmentPath = dto.AttachmentPath,
                    IsSigned = false,
                    IsDispensed = false,
                    CreatedAt = DateTime.UtcNow
                };

                if (dto.Medicines != null && dto.Medicines.Count > 0)
                {
                    foreach (var m in dto.Medicines)
                    {
                        prescription.Medicines.Add(new Medicine
                        {
                            Name = m.Name,
                            Dosage = m.Dosage,
                            Frequency = m.Frequency,
                            Duration = m.Duration
                        });
                    }
                }

                visit.Complaints = dto.ChiefComplaints;
                visit.Diagnosis = dto.Diagnosis;
                visit.Tests = dto.LabInvestigations;
                visit.Advice = dto.Notes;

                // 4. Atomic Save
                await _uow.BeginTransactionAsync();
                try
                {
                    await _uow.Prescriptions.AddAsync(prescription);
                    _uow.Visits.Update(visit);
                    
                    await _uow.SaveChangesAsync();
                    await _uow.CommitAsync();
                    
                    _logger.LogInformation("Successfully created prescription {PrescriptionId}", prescription.PrescriptionId);
                    return StatusCode(201, new { id = prescription.PrescriptionId });
                }
                catch (Exception ex)
                {
                    await _uow.RollbackAsync();
                    _logger.LogError(ex, "Database error creating prescription for VisitId: {VisitId}", dto.VisitId);
                    return StatusCode(500, ApiResponse.Fail("Database error occurred while saving prescription."));
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error in CreatePrescription for VisitId: {VisitId}", dto.VisitId);
                return StatusCode(500, ApiResponse.Fail($"Internal server error: {ex.Message}"));
            }
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
