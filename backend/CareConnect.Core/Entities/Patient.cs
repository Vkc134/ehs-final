using System.ComponentModel.DataAnnotations;

namespace CareConnect.Core.Entities
{
    public class Patient
    {
        [Key]
        public int PatientId { get; set; }

        [Required]
        public string PatientFirstName { get; set; } = string.Empty;

        public string PatientLastName { get; set; } = string.Empty;

        [Required]
        public DateTime DateOfBirth { get; set; }

        [Required]
        public string Gender { get; set; } = string.Empty;

        [Required]
        public string PhoneNumber { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public string Address { get; set; } = string.Empty;
        
        public string Prescription { get; set; } = string.Empty; // Initial notes from registration

        [Required]
        public string BloodGroup { get; set; } = string.Empty;

        [Required]
        public bool IsVyasa { get; set; }

        public ICollection<Visit> Visits { get; set; } = new List<Visit>();
    }
}
