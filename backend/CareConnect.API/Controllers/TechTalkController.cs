using CareConnect.Core.Entities;
using CareConnect.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CareConnect.API.Controllers
{
    [ApiController]
    [Route("api/techtalk")]
    public class TechTalkController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IWebHostEnvironment _env;

        // Allowed PPT file types
        private static readonly string[] AllowedPptExtensions =
            { ".ppt", ".pptx", ".pdf" };

        // Max PPT file size: 20 MB
        private const long MaxPptBytes = 20 * 1024 * 1024;

        public TechTalkController(ApplicationDbContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        // ─── DTOs ────────────────────────────────────────────────────────────────

        public class ExtendDto
        {
            public int Amount { get; set; }
        }

        // ─── Helper: get / create the techtalk uploads folder ────────────────────

        private string GetPptFolder()
        {
            var folder = Path.Combine(Directory.GetCurrentDirectory(), "uploads", "techtalk");
            if (!Directory.Exists(folder)) Directory.CreateDirectory(folder);
            return folder;
        }

        // ─── Endpoints ───────────────────────────────────────────────────────────

        /// <summary>
        /// GET /api/techtalk/settings
        /// Returns current capacity settings and registration stats.
        /// </summary>
        [HttpGet("settings")]
        public async Task<IActionResult> GetSettings()
        {
            var settings = await _context.TechTalkSettings.FirstOrDefaultAsync();
            if (settings == null) return NotFound("Settings not configured.");

            var count = await _context.TechTalkRegistrations.CountAsync();

            return Ok(new
            {
                settings.MaxCapacity,
                settings.IsOpen,
                settings.LastExtendedAt,
                settings.LastExtensionAmount,
                RegisteredCount = count,
                RemainingSeats = Math.Max(0, settings.MaxCapacity - count),
                IsFull = count >= settings.MaxCapacity
            });
        }

        /// <summary>
        /// POST /api/techtalk/register
        /// Registers a candidate with all form fields + optional PPT file (multipart/form-data).
        /// </summary>
        [HttpPost("register")]
        [RequestSizeLimit(25 * 1024 * 1024)] // 25 MB max request
        public async Task<IActionResult> Register([FromForm] string fullName,
                                                   [FromForm] string email,
                                                   [FromForm] string phone,
                                                   [FromForm] string college,
                                                   [FromForm] string yearOfStudy,
                                                   [FromForm] string pptTopic,
                                                   [FromForm] string? referredBy,
                                                   IFormFile? pptFile)
        {
            // ── Validate required fields ──
            if (string.IsNullOrWhiteSpace(fullName) ||
                string.IsNullOrWhiteSpace(email) ||
                string.IsNullOrWhiteSpace(phone) ||
                string.IsNullOrWhiteSpace(college) ||
                string.IsNullOrWhiteSpace(yearOfStudy) ||
                string.IsNullOrWhiteSpace(pptTopic))
            {
                return BadRequest(new { message = "All required fields must be filled." });
            }

            var settings = await _context.TechTalkSettings.FirstOrDefaultAsync();
            if (settings == null) return StatusCode(500, new { message = "Settings not configured." });

            if (!settings.IsOpen)
                return BadRequest(new { message = "Registrations are currently closed." });

            var count = await _context.TechTalkRegistrations.CountAsync();
            if (count >= settings.MaxCapacity)
                return BadRequest(new { message = "All seats are filled. Registrations are closed." });

            // ── Duplicate email check ──
            var emailNormalized = email.Trim().ToLower();
            var duplicate = await _context.TechTalkRegistrations
                .AnyAsync(r => r.Email.ToLower() == emailNormalized);
            if (duplicate)
                return Conflict(new { message = "This email is already registered." });

            // ── Handle PPT upload (optional) ──
            string pptFilePath = string.Empty;
            string pptOriginalName = string.Empty;

            if (pptFile != null && pptFile.Length > 0)
            {
                var ext = Path.GetExtension(pptFile.FileName).ToLowerInvariant();
                if (!AllowedPptExtensions.Contains(ext))
                    return BadRequest(new { message = "Only .ppt, .pptx, or .pdf files are accepted." });

                if (pptFile.Length > MaxPptBytes)
                    return BadRequest(new { message = "PPT file must be under 20 MB." });

                var folder = GetPptFolder();
                var safeFileName = $"{Guid.NewGuid()}{ext}";
                var fullPath = Path.Combine(folder, safeFileName);

                using var stream = new FileStream(fullPath, FileMode.Create);
                await pptFile.CopyToAsync(stream);

                pptFilePath = $"/uploads/techtalk/{safeFileName}";
                pptOriginalName = pptFile.FileName;
            }

            var registration = new TechTalkRegistration
            {
                FullName = fullName.Trim(),
                Email = email.Trim(),
                Phone = phone.Trim(),
                College = college.Trim(),
                YearOfStudy = yearOfStudy.Trim(),
                PptTopic = pptTopic.Trim(),
                ReferredBy = (referredBy ?? string.Empty).Trim(),
                PptFilePath = pptFilePath,
                PptOriginalName = pptOriginalName,
                RegisteredAt = DateTime.UtcNow
            };

            _context.TechTalkRegistrations.Add(registration);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Registration successful! We'll see you at Tech Talk 2026 🚀",
                registrationId = registration.Id,
                name = registration.FullName,
                pptUploaded = !string.IsNullOrEmpty(pptFilePath)
            });
        }

        /// <summary>
        /// POST /api/techtalk/upload-ppt/{id}
        /// Upload / replace PPT for an existing registration.
        /// </summary>
        [HttpPost("upload-ppt/{id:int}")]
        [RequestSizeLimit(25 * 1024 * 1024)]
        public async Task<IActionResult> UploadPpt(int id, IFormFile? pptFile)
        {
            var reg = await _context.TechTalkRegistrations.FindAsync(id);
            if (reg == null) return NotFound(new { message = "Registration not found." });

            if (pptFile == null || pptFile.Length == 0)
                return BadRequest(new { message = "No file provided." });

            var ext = Path.GetExtension(pptFile.FileName).ToLowerInvariant();
            if (!AllowedPptExtensions.Contains(ext))
                return BadRequest(new { message = "Only .ppt, .pptx, or .pdf files are accepted." });

            if (pptFile.Length > MaxPptBytes)
                return BadRequest(new { message = "PPT file must be under 20 MB." });

            // Delete old file if exists
            if (!string.IsNullOrEmpty(reg.PptFilePath))
            {
                var oldPath = Path.Combine(Directory.GetCurrentDirectory(), reg.PptFilePath.TrimStart('/'));
                if (System.IO.File.Exists(oldPath)) System.IO.File.Delete(oldPath);
            }

            var folder = GetPptFolder();
            var safeFileName = $"{Guid.NewGuid()}{ext}";
            var fullPath = Path.Combine(folder, safeFileName);

            using var stream = new FileStream(fullPath, FileMode.Create);
            await pptFile.CopyToAsync(stream);

            reg.PptFilePath = $"/uploads/techtalk/{safeFileName}";
            reg.PptOriginalName = pptFile.FileName;
            await _context.SaveChangesAsync();

            return Ok(new { message = "PPT uploaded successfully.", pptFilePath = reg.PptFilePath, pptOriginalName = reg.PptOriginalName });
        }

        /// <summary>
        /// GET /api/techtalk/registrations
        /// Returns all registrations including PPT info (admin use).
        /// </summary>
        [HttpGet("registrations")]
        public async Task<IActionResult> GetRegistrations()
        {
            var registrations = await _context.TechTalkRegistrations
                .OrderBy(r => r.RegisteredAt)
                .Select(r => new
                {
                    r.Id,
                    r.FullName,
                    r.Email,
                    r.Phone,
                    r.College,
                    r.YearOfStudy,
                    r.PptTopic,
                    r.ReferredBy,
                    r.PptFilePath,
                    r.PptOriginalName,
                    r.RegisteredAt
                })
                .ToListAsync();

            return Ok(registrations);
        }

        /// <summary>
        /// PATCH /api/techtalk/settings/extend
        /// Increases capacity by a specified amount.
        /// </summary>
        [HttpPatch("settings/extend")]
        public async Task<IActionResult> ExtendCapacity([FromBody] ExtendDto dto)
        {
            if (dto.Amount <= 0)
                return BadRequest(new { message = "Extension amount must be positive." });

            if (dto.Amount > 500)
                return BadRequest(new { message = "Cannot extend by more than 500 at once." });

            var settings = await _context.TechTalkSettings.FirstOrDefaultAsync();
            if (settings == null) return NotFound("Settings not configured.");

            settings.MaxCapacity += dto.Amount;
            settings.LastExtendedAt = DateTime.UtcNow;
            settings.LastExtensionAmount = dto.Amount;
            await _context.SaveChangesAsync();

            var count = await _context.TechTalkRegistrations.CountAsync();
            return Ok(new
            {
                message = $"Capacity extended by {dto.Amount}. New limit: {settings.MaxCapacity}.",
                settings.MaxCapacity,
                settings.IsOpen,
                RegisteredCount = count,
                RemainingSeats = Math.Max(0, settings.MaxCapacity - count)
            });
        }

        /// <summary>
        /// PATCH /api/techtalk/settings/toggle
        /// Toggles the registration open/closed state.
        /// </summary>
        [HttpPatch("settings/toggle")]
        public async Task<IActionResult> ToggleRegistration()
        {
            var settings = await _context.TechTalkSettings.FirstOrDefaultAsync();
            if (settings == null) return NotFound("Settings not configured.");

            settings.IsOpen = !settings.IsOpen;
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = settings.IsOpen ? "Registrations are now OPEN." : "Registrations are now CLOSED.",
                settings.IsOpen
            });
        }

        /// <summary>
        /// DELETE /api/techtalk/registrations/{id}
        /// Removes a registration and deletes its PPT file (admin use).
        /// </summary>
        [HttpDelete("registrations/{id:int}")]
        public async Task<IActionResult> DeleteRegistration(int id)
        {
            var registration = await _context.TechTalkRegistrations.FindAsync(id);
            if (registration == null)
                return NotFound(new { message = "Registration not found." });

            // Clean up PPT file
            if (!string.IsNullOrEmpty(registration.PptFilePath))
            {
                var filePath = Path.Combine(Directory.GetCurrentDirectory(), registration.PptFilePath.TrimStart('/'));
                if (System.IO.File.Exists(filePath)) System.IO.File.Delete(filePath);
            }

            _context.TechTalkRegistrations.Remove(registration);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Registration removed successfully." });
        }
    }
}
