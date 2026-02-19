using CareConnect.Core.DTOs;

namespace CareConnect.Core.Interfaces
{
    public interface IAuthService
    {
        Task<AuthResponseDto?> LoginAsync(LoginDto loginDto);
        Task<List<UserDto>> GetDoctorsAsync();
    }
}
