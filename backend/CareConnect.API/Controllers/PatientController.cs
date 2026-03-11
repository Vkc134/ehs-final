using CareConnect.Core.Common;
using CareConnect.Core.DTOs;
using CareConnect.Core.Entities;
using CareConnect.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CareConnect.API.Controllers
{
    [Route("api/patients")]
    [ApiController]
    [Authorize]
    public class PatientController : ControllerBase
    {
        private readonly IUnitOfWork _uow;

        public PatientController(IUnitOfWork uow) => _uow = uow;

        [HttpGet]
        [ProducesResponseType(typeof(ApiResponse<IEnumerable<PatientDto>>), 200)]
        public async Task<IActionResult> GetPatients()
        {
            var patients = await _uow.Patients.GetAllDtosAsync();
            return Ok(patients);
        }

        [HttpGet("{id}")]
        [ProducesResponseType(typeof(ApiResponse<PatientDto>), 200)]
        [ProducesResponseType(typeof(ApiResponse), 404)]
        public async Task<IActionResult> GetPatient(int id)
        {
            var patient = await _uow.Patients.GetDtoByIdAsync(id);
            if (patient == null)
                return NotFound(new { message = $"Patient with id {id} not found." });

            return Ok(patient);
        }

        [HttpPost]
        [ProducesResponseType(typeof(ApiResponse<PatientDto>), 201)]
        [ProducesResponseType(typeof(ApiResponse), 400)]
        public async Task<IActionResult> CreatePatient([FromBody] CreatePatientDto dto)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage).ToList();
                return BadRequest(ApiResponse.Fail("Validation failed.", errors));
            }

            DateTime.TryParse(dto.DateOfBirth, out var dob);

            var patient = new Patient
            {
                PatientFirstName = dto.PatientFirstName,
                PatientLastName = dto.PatientLastName,
                DateOfBirth = dob,
                Gender = dto.Gender,
                PhoneNumber = dto.PhoneNumber,
                Email = dto.Email,
                Address = dto.Address,
                Prescription = dto.Prescription,
                BloodGroup = dto.BloodGroup,
                IsVyasa = dto.IsVyasa
            };

            await _uow.Patients.AddAsync(patient);
            await _uow.SaveChangesAsync();

            var result = await _uow.Patients.GetDtoByIdAsync(patient.PatientId);
            return CreatedAtAction(nameof(GetPatient), new { id = patient.PatientId }, result);
        }
    }
}
