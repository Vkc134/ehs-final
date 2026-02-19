using CareConnect.Core.DTOs;
using CareConnect.Core.Entities;
using CareConnect.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CareConnect.API.Controllers
{
    [Route("api/prescriptions")]
    [ApiController]
    public class PrescriptionController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public PrescriptionController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        [Authorize(Roles = "Doctor,Pharmacist")]
        public async Task<ActionResult<IEnumerable<PrescriptionDto>>> GetPrescriptions()
        {
            var prescriptions = await _context.Prescriptions
                .Include(p => p.Medicines)
                .Include(p => p.Visit)
                    .ThenInclude(v => v.Patient)
                .OrderByDescending(p => p.CreatedAt)
                .Select(p => new PrescriptionDto
                {
                    PrescriptionId = p.PrescriptionId,
                    VisitId = p.VisitId,
                    Notes = p.Notes,
                    AttachmentPath = p.AttachmentPath,
                    IsSigned = p.IsSigned,
                    IsDispensed = p.IsDispensed,
                    CreatedAt = p.CreatedAt,
                    Medicines = p.Medicines.Select(m => new MedicineDto
                    {
                        Name = m.Name,
                        Dosage = m.Dosage,
                        Frequency = m.Frequency,
                        Duration = m.Duration
                    }).ToList(),
                    Visit = new PrescriptionVisitDto
                    {
                        PatientId = p.Visit != null ? p.Visit.PatientId : 0,
                        PatientFirstName = p.Visit != null && p.Visit.Patient != null ? p.Visit.Patient.PatientFirstName : "N/A",
                        PatientLastName = p.Visit != null && p.Visit.Patient != null ? p.Visit.Patient.PatientLastName : "N/A",
                        Gender = p.Visit != null && p.Visit.Patient != null ? p.Visit.Patient.Gender : "N/A",
                        PatientAge = p.Visit != null && p.Visit.Patient != null ? (DateTime.UtcNow.Year - p.Visit.Patient.DateOfBirth.Year).ToString() : "N/A",
                        PatientAddress = p.Visit != null && p.Visit.Patient != null ? p.Visit.Patient.Address : "N/A",
                        PatientPhone = p.Visit != null && p.Visit.Patient != null ? p.Visit.Patient.PhoneNumber : "N/A",
                        ConsultantDoctorName = p.Visit != null ? p.Visit.ConsultantDoctorName : "N/A"
                    }
                })
                .ToListAsync();

            return Ok(prescriptions);
        }

        [HttpPost]
        [Authorize(Roles = "Doctor")]
        public async Task<ActionResult> CreatePrescription(CreatePrescriptionDto dto)
        {
            // Note: Transactions are not supported by InMemory provider. 
            // For SQL Server, wrap this in using var transaction = ...
            
            try
            {
                var prescription = new Prescription
                {
                    VisitId = dto.VisitId,
                    Notes = dto.Notes,
                    AttachmentPath = dto.AttachmentPath,
                    IsSigned = false,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Prescriptions.Add(prescription);

                // Update Visit Details (Complaints, Diagnosis, etc.)
                var visit = await _context.Visits.FindAsync(dto.VisitId);
                if (visit != null)
                {
                    visit.Complaints = dto.ChiefComplaints;
                    visit.Diagnosis = dto.Diagnosis;
                    visit.Tests = dto.LabInvestigations;
                    visit.Advice = dto.Notes; // Also save notes to Advice for redundancy/consistency
                }

                await _context.SaveChangesAsync();

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

                    _context.Medicines.AddRange(medicines);
                    await _context.SaveChangesAsync();
                }

                return Ok(new { id = prescription.PrescriptionId });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message, stackTrace = ex.StackTrace, innerException = ex.InnerException?.Message });
            }
        }

        [HttpPatch("{id}/sign-off")]
        [Authorize(Roles = "Doctor")]
        public async Task<ActionResult> SignOff(int id)
        {
            var prescription = await _context.Prescriptions.FindAsync(id);
            if (prescription == null) return NotFound();

            prescription.IsSigned = true;

            var visit = await _context.Visits.FindAsync(prescription.VisitId);
            if (visit != null)
            {
                visit.Status = "Completed";
            }

            await _context.SaveChangesAsync();
            return Ok();
        }

        [HttpPatch("{id}/dispense")]
        [Authorize(Roles = "Pharmacist")]
        public async Task<ActionResult> Dispense(int id)
        {
            var prescription = await _context.Prescriptions.FindAsync(id);
            if (prescription == null) return NotFound();

            prescription.IsDispensed = true;
            await _context.SaveChangesAsync();
            return Ok();
        }
    }
}
