using CareConnect.Core.Entities;
using CareConnect.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CareConnect.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DrugsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public DrugsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Drug>>> Search([FromQuery] string query)
        {
            if (string.IsNullOrWhiteSpace(query))
                return Ok(new List<Drug>());

            var drugs = await _context.Drugs
                .Where(d => EF.Functions.Like(d.Name, $"%{query}%"))
                .Take(10)
                .ToListAsync();

            return Ok(drugs);
        }

        [HttpPost]
        public async Task<ActionResult<Drug>> Add([FromBody] Drug drug)
        {
            if (string.IsNullOrWhiteSpace(drug.Name))
                return BadRequest("Name is required");

            var existing = await _context.Drugs.FirstOrDefaultAsync(d => d.Name == drug.Name);
            if (existing != null)
                return Ok(existing);

            _context.Drugs.Add(drug);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(Search), new { query = drug.Name }, drug);
        }
    }
}
