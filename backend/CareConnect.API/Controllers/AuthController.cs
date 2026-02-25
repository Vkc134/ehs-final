using CareConnect.Core.DTOs;
using CareConnect.Core.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace CareConnect.API.Controllers
{
    [Route("auth")] // Matches /auth/login from frontend
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("login")]
        public async Task<ActionResult<AuthResponseDto>> Login([FromBody] LoginDto loginDto)
        {
            var response = await _authService.LoginAsync(loginDto);
            if (response == null)
            {
                return Unauthorized(new { message = "Invalid email or password" });
            }
            return Ok(response);
        }

        [HttpGet("doctors")]
        public async Task<ActionResult<List<UserDto>>> GetDoctors()
        {
            var doctors = await _authService.GetDoctorsAsync();
            return Ok(doctors);
        }
    }
}
