using CareConnect.Core.DTOs;
using CareConnect.Core.Entities;
using CareConnect.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CareConnect.API.Controllers
{
    [Route("api/vitals")]
    [ApiController]
    [Authorize]
    public class VitalsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public VitalsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<ActionResult> RecordVitals(CreateVitalsDto dto)
        {
            try
            {
                var vitals = new Vitals
                {
                    VisitId = dto.VisitId,
                    BloodPressure = dto.BloodPressure,
                    Pulse = dto.Pulse,
                    Temperature = dto.Temperature,
                    SpO2 = dto.SpO2,
                    Weight = dto.Weight,
                    Height = dto.Height,
                    BMI = dto.BMI
                };

                _context.Vitals.Add(vitals);
                await _context.SaveChangesAsync();

                // Update visit status
                var visit = await _context.Visits.FindAsync(dto.VisitId);
                if (visit != null)
                {
                    visit.Status = "Vitals Recorded";
                    await _context.SaveChangesAsync();
                }

                return Ok();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal Server Error: {ex.Message} - {ex.InnerException?.Message}");
            }
        }

        [HttpGet("preview/{visitId}")]
        public async Task<ActionResult<VitalsDto>> GetPreview(int visitId)
        {
            var vitals = await _context.Vitals.FirstOrDefaultAsync(v => v.VisitId == visitId);
            if (vitals == null) return NotFound();

            return new VitalsDto
            {
                VitalsId = vitals.VitalsId,
                VisitId = vitals.VisitId,
                BloodPressure = vitals.BloodPressure,
                Pulse = vitals.Pulse,
                Temperature = vitals.Temperature,
                SpO2 = vitals.SpO2,
                Weight = vitals.Weight,
                Height = vitals.Height,
                BMI = vitals.BMI
            };
        }
    }
}
