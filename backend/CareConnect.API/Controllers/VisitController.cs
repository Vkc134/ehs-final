using CareConnect.Core.DTOs;
using CareConnect.Core.Entities;
using CareConnect.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CareConnect.API.Controllers
{
    [Route("api/visits")]
    [ApiController]
    [Authorize]
    public class VisitController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public VisitController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<List<VisitDto>>> GetVisits([FromQuery] string? doctorName = null, [FromQuery] int? patientId = null)
        {
            var query = _context.Visits.AsQueryable();

            if (!string.IsNullOrEmpty(doctorName))
            {
                query = query.Where(v => v.ConsultantDoctorName == doctorName);
            }

            if (patientId.HasValue)
            {
                query = query.Where(v => v.PatientId == patientId.Value);
            }

            var visits = await query
                .Include(v => v.Patient)
                .Include(v => v.Vitals)
                .Include(v => v.Prescription)
                    .ThenInclude(p => p.Medicines)
                .OrderByDescending(v => v.CreatedAt)
                .Select(v => new VisitDto
                {
                    VisitId = v.VisitId,
                    PatientId = v.PatientId,
                    PatientName = v.Patient!.PatientFirstName + " " + v.Patient.PatientLastName,
                    ConsultantDoctorName = v.ConsultantDoctorName,
                    Priority = v.Priority,
                    Status = v.Status,
                    CreatedAt = v.CreatedAt,
                    AttachmentPath = v.AttachmentPath,
                    
                    // Detailed Fields
                    Complaints = v.Complaints,
                    Diagnosis = v.Diagnosis,
                    Advice = v.Advice,
                    Tests = v.Tests,
                    
                    Vitals = v.Vitals != null ? new VitalsDto 
                    {
                        VitalsId = v.Vitals.VitalsId,
                        VisitId = v.Vitals.VisitId,
                        BloodPressure = v.Vitals.BloodPressure,
                        Pulse = v.Vitals.Pulse,
                        Temperature = v.Vitals.Temperature,
                        SpO2 = v.Vitals.SpO2,
                        Weight = v.Vitals.Weight,
                        Height = v.Vitals.Height,
                        BMI = v.Vitals.BMI
                    } : null,

                    Medicines = v.Prescription != null 
                        ? v.Prescription.Medicines.Select(m => new MedicineDto 
                          {
                              Name = m.Name,
                              Dosage = m.Dosage,
                              Frequency = m.Frequency,
                              Duration = m.Duration
                          }).ToList()
                        : new List<MedicineDto>()
                })
                .ToListAsync();

            return Ok(visits);
        }

        [HttpPost]
        public async Task<ActionResult> CreateVisit(CreateVisitDto dto)
        {
            var visit = new Visit
            {
                PatientId = dto.PatientId,
                ConsultantDoctorName = dto.ConsultantDoctorName,
                Priority = dto.Priority,
                Status = "Pending",
                CreatedAt = DateTime.UtcNow
            };

            _context.Visits.Add(visit);
            await _context.SaveChangesAsync();

            return Ok();
        }

        [HttpPut("{id}/status")]
        public async Task<ActionResult> UpdateStatus(int id, [FromBody] UpdateVisitStatusDto dto)
        {
            var visit = await _context.Visits.FindAsync(id);
            if (visit == null) return NotFound();

            visit.Status = dto.Status;
            await _context.SaveChangesAsync();

            return Ok();
        }

        [HttpPatch("{id}/attachment")]
        public async Task<ActionResult> UploadAttachment(int id, [FromBody] UpdateVisitAttachmentDto dto)
        {
            var visit = await _context.Visits.FindAsync(id);
            if (visit == null) return NotFound();

            visit.AttachmentPath = dto.AttachmentPath;
            await _context.SaveChangesAsync();

            return Ok();
        }
    }

}
