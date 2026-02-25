namespace CareConnect.Core.DTOs
{
    public class PatientDto
    {
        public int PatientId { get; set; }
        public string PatientFirstName { get; set; } = string.Empty;
        public string PatientLastName { get; set; } = string.Empty;
        public DateTime DateOfBirth { get; set; }
        public string Gender { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string Prescription { get; set; } = string.Empty;
        public string BloodGroup { get; set; } = string.Empty;
        public bool IsVyasa { get; set; }
    }

    public class CreatePatientDto
    {
        public string PatientFirstName { get; set; } = string.Empty;
        public string PatientLastName { get; set; } = string.Empty;
        public string DateOfBirth { get; set; } = string.Empty; // Frontend sends string from date input
        public string Gender { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string Prescription { get; set; } = string.Empty;
        public string BloodGroup { get; set; } = string.Empty;
        public bool IsVyasa { get; set; }
    }
}
