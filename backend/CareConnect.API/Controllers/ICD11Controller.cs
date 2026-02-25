using CareConnect.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using CareConnect.Core.Entities;
using CareConnect.Infrastructure.Services;
using Microsoft.AspNetCore.Mvc;

namespace CareConnect.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ICD11Controller : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ICD11Controller(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<dynamic>>> Search([FromQuery] string search)
        {
            if (string.IsNullOrWhiteSpace(search))
            {
                return Ok(new List<dynamic>());
            }

            // Search Local DB Only
            var results = await _context.ICD11Codes
                .Where(c => EF.Functions.Like(c.Code, $"%{search}%") || 
                            EF.Functions.Like(c.Description, $"%{search}%"))
                .Take(20)
                .Select(r => new 
                {
                    r.Id,
                    r.Code,
                    r.Description
                })
                .ToListAsync();

            return Ok(results);
        }

        [HttpPost]
        public async Task<ActionResult> SaveCode([FromBody] ICD11CodeDto dto)
        {
            if (string.IsNullOrEmpty(dto.Description))
                return BadRequest("Description is required");

            // Look up by exact description to avoid duplicates
            var existing = await _context.ICD11Codes
                .FirstOrDefaultAsync(c => c.Description.ToLower() == dto.Description.ToLower());

            if (existing != null)
            {
                return Ok(new { message = "Diagnosis already exists", code = existing.Code, id = existing.Id });
            }

            // If Code is missing, generate a custom one
            string code = dto.Code;
            if (string.IsNullOrEmpty(code))
            {
                // Generate simple custom code: CUS-{Random}
                code = "CUS-" + new Random().Next(1000, 9999);
            }

            var newDiagnosis = new ICD11Code 
            { 
                Code = code, 
                Description = dto.Description 
            };

            _context.ICD11Codes.Add(newDiagnosis);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Saved locally", code = newDiagnosis.Code, id = newDiagnosis.Id });
        }

        [HttpPost("bulk")]
        public async Task<ActionResult> BulkImport([FromBody] List<ICD11CodeDto> dtos)
        {
            if (dtos == null || !dtos.Any())
                return BadRequest("No data provided");

            // Filter out empty descriptions
            var validDtos = dtos.Where(d => !string.IsNullOrWhiteSpace(d.Description)).ToList();
            
            // Get existing descriptions to prevent duplicates (in memory comparison for speed if table is small, otherwise batch)
            // Assuming table might be large, let's just insert ignoring duplicates or use a more complex check.
            // For simplicity in this context, we'll check against existing in a simplistic way or just insert diverse data.
            // Actually, inserting one by one is slow. Let's start with a check.
            
            var existingDescriptions = await _context.ICD11Codes
                .Select(c => c.Description.ToLower())
                .ToListAsync();

            var newCodes = new List<ICD11Code>();
            var existingSet = new HashSet<string>(existingDescriptions);

            foreach (var dto in validDtos)
            {
                if (existingSet.Contains(dto.Description.ToLower()))
                    continue;

                string code = dto.Code;
                if (string.IsNullOrEmpty(code))
                {
                    code = "CUS-" + new Random().Next(10000, 99999); // Simple random
                }

                newCodes.Add(new ICD11Code 
                { 
                    Code = code, 
                    Description = dto.Description 
                });
                
                existingSet.Add(dto.Description.ToLower());
            }

            if (newCodes.Any())
            {
                await _context.ICD11Codes.AddRangeAsync(newCodes);
                await _context.SaveChangesAsync();
            }

            return Ok(new { message = $"Imported {newCodes.Count} diagnoses", duplicateCount = validDtos.Count - newCodes.Count });
        }
    }

    public class ICD11CodeDto
    {
        public string? Code { get; set; }
        public string Description { get; set; }
    }
}
