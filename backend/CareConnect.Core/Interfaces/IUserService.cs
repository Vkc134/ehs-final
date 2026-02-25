using CareConnect.Core.DTOs;

namespace CareConnect.Core.Interfaces
{
    public interface IUserService
    {
        Task<UserDto> CreateUserAsync(CreateUserDto dto);
        Task<List<UserDto>> GetAllUsersAsync();
        Task<bool> DeleteUserAsync(int id);
        Task<bool> ResetPasswordAsync(int id, string newPassword);
    }
}
