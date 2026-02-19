using CareConnect.Core.DTOs;
using CareConnect.Core.Entities;
using CareConnect.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CareConnect.API.Controllers
{
    [Route("api/patients")]
    [ApiController]
    [Authorize] // Requires Token
    public class PatientController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public PatientController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<List<PatientDto>>> GetPatients()
        {
            var patients = await _context.Patients
                .Select(p => new PatientDto
                {
                    PatientId = p.PatientId,
                    PatientFirstName = p.PatientFirstName,
                    PatientLastName = p.PatientLastName,
                    DateOfBirth = p.DateOfBirth,
                    Gender = p.Gender,
                    PhoneNumber = p.PhoneNumber,
                    Email = p.Email,
                    Address = p.Address,
                    Prescription = p.Prescription,
                    BloodGroup = p.BloodGroup,
                    IsVyasa = p.IsVyasa
                })
                .ToListAsync();

            return Ok(patients);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<PatientDto>> GetPatient(int id)
        {
            var p = await _context.Patients.FindAsync(id);
            if (p == null) return NotFound();

            return new PatientDto
            {
                PatientId = p.PatientId,
                PatientFirstName = p.PatientFirstName,
                PatientLastName = p.PatientLastName,
                DateOfBirth = p.DateOfBirth,
                Gender = p.Gender,
                PhoneNumber = p.PhoneNumber,
                Email = p.Email,
                Address = p.Address,
                Prescription = p.Prescription,
                BloodGroup = p.BloodGroup,
                IsVyasa = p.IsVyasa
            };
        }

        [HttpPost]
        public async Task<ActionResult<PatientDto>> CreatePatient(CreatePatientDto dto)
        {
            // Frontend sends DoB as string "YYYY-MM-DD"
            DateTime dob;
            DateTime.TryParse(dto.DateOfBirth, out dob);

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

            _context.Patients.Add(patient);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetPatient), new { id = patient.PatientId }, patient);
        }
    }
}
