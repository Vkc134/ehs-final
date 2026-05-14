using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CareConnect.Core.Entities
{
    public class Visit
    {
        [Key]
        public int VisitId { get; set; }

        [Required]
        public int PatientId { get; set; }

        [ForeignKey("PatientId")]
        public Patient? Patient { get; set; }

        public string ConsultantDoctorName { get; set; } = string.Empty;

        public string Priority { get; set; } = "Normal";

        public string Status { get; set; } = "Pending"; // Pending, Vitals Recorded, Completed

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // One-to-One with Vitals
        public Vitals? Vitals { get; set; }

        // One-to-One with Prescription (or One-to-Many if multiple allowed, but prompt implies singular flow)
        // One-to-One with Prescription (or One-to-Many if multiple allowed, but prompt implies singular flow)
        public Prescription? Prescription { get; set; }

        public string? AttachmentPath { get; set; }

        // JSON stored strings for lists
        public string Complaints { get; set; } = "[]"; 
        public string Diagnosis { get; set; } = "[]";
        public string Advice { get; set; } = "";
        public string Tests { get; set; } = "[]";
    }
}
