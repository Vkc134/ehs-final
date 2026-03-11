using CareConnect.Core.Common;
using CareConnect.Core.DTOs;
using CareConnect.Core.Entities;
using CareConnect.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CareConnect.API.Controllers
{
    [Route("api/visits")]
    [ApiController]
    [Authorize]
    public class VisitController : ControllerBase
    {
        private readonly IUnitOfWork _uow;

        public VisitController(IUnitOfWork uow) => _uow = uow;

        [HttpGet]
        [ProducesResponseType(typeof(ApiResponse<IEnumerable<VisitDto>>), 200)]
        public async Task<IActionResult> GetVisits(
            [FromQuery] string? doctorName = null,
            [FromQuery] int? patientId = null)
        {
            var visits = await _uow.Visits.GetFilteredDtosAsync(doctorName, patientId);
            return Ok(visits);
        }

        [HttpPost]
        [ProducesResponseType(typeof(ApiResponse), 201)]
        [ProducesResponseType(typeof(ApiResponse), 400)]
        public async Task<IActionResult> CreateVisit([FromBody] CreateVisitDto dto)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage).ToList();
                return BadRequest(ApiResponse.Fail("Validation failed.", errors));
            }

            var visit = new Visit
            {
                PatientId = dto.PatientId,
                ConsultantDoctorName = dto.ConsultantDoctorName,
                Priority = dto.Priority,
                Status = "Pending",
                CreatedAt = DateTime.UtcNow
            };

            await _uow.Visits.AddAsync(visit);
            await _uow.SaveChangesAsync();

            return StatusCode(201, new { message = "Visit created successfully." });
        }

        [HttpPut("{id}/status")]
        [ProducesResponseType(typeof(ApiResponse), 200)]
        [ProducesResponseType(typeof(ApiResponse), 404)]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateVisitStatusDto dto)
        {
            var visit = await _uow.Visits.GetByIdAsync(id);
            if (visit == null)
                return NotFound(ApiResponse.Fail($"Visit {id} not found."));

            visit.Status = dto.Status;
            _uow.Visits.Update(visit);
            await _uow.SaveChangesAsync();

            return Ok(new { message = "Visit status updated." });
        }

        [HttpPatch("{id}/attachment")]
        [ProducesResponseType(typeof(ApiResponse), 200)]
        [ProducesResponseType(typeof(ApiResponse), 404)]
        public async Task<IActionResult> UploadAttachment(int id, [FromBody] UpdateVisitAttachmentDto dto)
        {
            var visit = await _uow.Visits.GetByIdAsync(id);
            if (visit == null)
                return NotFound(ApiResponse.Fail($"Visit {id} not found."));

            visit.AttachmentPath = dto.AttachmentPath;
            _uow.Visits.Update(visit);
            await _uow.SaveChangesAsync();

            return Ok(new { message = "Attachment updated." });
        }
    }
}
