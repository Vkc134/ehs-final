using CareConnect.Core.Common;
using CareConnect.Core.DTOs;
using CareConnect.Core.Entities;
using CareConnect.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CareConnect.API.Controllers
{
    [Route("api/vitals")]
    [ApiController]
    [Authorize]
    public class VitalsController : ControllerBase
    {
        private readonly IUnitOfWork _uow;

        public VitalsController(IUnitOfWork uow) => _uow = uow;

        [HttpPost]
        [ProducesResponseType(typeof(ApiResponse), 200)]
        [ProducesResponseType(typeof(ApiResponse), 400)]
        [ProducesResponseType(typeof(ApiResponse), 404)]
        public async Task<IActionResult> RecordVitals([FromBody] CreateVitalsDto dto)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage).ToList();
                return BadRequest(ApiResponse.Fail("Validation failed.", errors));
            }

            await _uow.BeginTransactionAsync();

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

            await _uow.Vitals.AddAsync(vitals);
            await _uow.SaveChangesAsync();

            var visit = await _uow.Visits.GetByIdAsync(dto.VisitId);
            if (visit == null)
            {
                await _uow.RollbackAsync();
                return NotFound(ApiResponse.Fail($"Visit {dto.VisitId} not found."));
            }

            visit.Status = "Vitals Recorded";
            _uow.Visits.Update(visit);
            await _uow.SaveChangesAsync();
            await _uow.CommitAsync();

            return Ok(ApiResponse.Ok("Vitals recorded successfully."));
        }

        [HttpGet("preview/{visitId}")]
        [ProducesResponseType(typeof(ApiResponse<VitalsDto>), 200)]
        [ProducesResponseType(typeof(ApiResponse), 404)]
        public async Task<IActionResult> GetPreview(int visitId)
        {
            var vitals = await _uow.Vitals.GetByVisitIdAsync(visitId);
            if (vitals == null)
                return NotFound(ApiResponse.Fail($"No vitals recorded for visit {visitId}."));

            return Ok(ApiResponse<VitalsDto>.Ok(vitals));
        }
    }
}
