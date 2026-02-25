using CareConnect.Core.DTOs;
using CareConnect.Core.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace CareConnect.API.Controllers
{
    [Route("admin/users")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;

        public UserController(IUserService userService)
        {
            _userService = userService;
        }

        /// <summary>
        /// Get all users in the system
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<List<UserDto>>> GetAll()
        {
            var users = await _userService.GetAllUsersAsync();
            return Ok(users);
        }

        /// <summary>
        /// Create a new user (Doctor, Nurse, Pharmacist)
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<UserDto>> Create([FromBody] CreateUserDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Password))
                return BadRequest(new { message = "Email and Password are required." });

            var validRoles = new[] { "Doctor", "Nurse", "Pharmacist" };
            if (!validRoles.Contains(dto.Role))
                return BadRequest(new { message = "Role must be one of: Doctor, Nurse, Pharmacist" });

            var user = await _userService.CreateUserAsync(dto);
            return CreatedAtAction(nameof(GetAll), new { id = user.Id }, user);
        }

        /// <summary>
        /// Delete a user by ID
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var success = await _userService.DeleteUserAsync(id);
            if (!success) return NotFound(new { message = "User not found." });
            return NoContent();
        }

        /// <summary>
        /// Reset a user's password
        /// </summary>
        [HttpPut("{id}/reset-password")]
        public async Task<IActionResult> ResetPassword(int id, [FromBody] UpdatePasswordDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.NewPassword))
                return BadRequest(new { message = "NewPassword is required." });

            var success = await _userService.ResetPasswordAsync(id, dto.NewPassword);
            if (!success) return NotFound(new { message = "User not found." });
            return Ok(new { message = "Password updated successfully." });
        }
    }
}
