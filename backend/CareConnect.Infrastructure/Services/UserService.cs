using CareConnect.Core.DTOs;
using CareConnect.Core.Entities;
using CareConnect.Core.Interfaces;
using CareConnect.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CareConnect.Infrastructure.Services
{
    public class UserService : IUserService
    {
        private readonly ApplicationDbContext _context;

        public UserService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<UserDto> CreateUserAsync(CreateUserDto dto)
        {
            // Hash the password using BCrypt
            var hash = BCrypt.Net.BCrypt.HashPassword(dto.Password);

            var user = new User
            {
                Email = dto.Email,
                Name = dto.Name,
                Credentials = dto.Credentials,
                Role = dto.Role,
                PasswordHash = hash
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                Name = user.Name,
                Credentials = user.Credentials,
                Role = user.Role
            };
        }

        public async Task<List<UserDto>> GetAllUsersAsync()
        {
            return await _context.Users
                .Select(u => new UserDto
                {
                    Id = u.Id,
                    Email = u.Email,
                    Name = u.Name,
                    Credentials = u.Credentials,
                    Role = u.Role
                })
                .ToListAsync();
        }

        public async Task<bool> DeleteUserAsync(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return false;

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ResetPasswordAsync(int id, string newPassword)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return false;

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(newPassword);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
