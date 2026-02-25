namespace CareConnect.Core.DTOs
{
    public class CreateUserDto
    {
        public string Email { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Credentials { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty; // Doctor | Nurse | Pharmacist
        public string Password { get; set; } = string.Empty;
    }

    public class UpdatePasswordDto
    {
        public string NewPassword { get; set; } = string.Empty;
    }
}
