using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CareConnect.Core.Entities
{
    public class Prescription
    {
        [Key]
        public int PrescriptionId { get; set; }

        [Required]
        public int VisitId { get; set; }

        [ForeignKey("VisitId")]
        public Visit? Visit { get; set; }

        public string Notes { get; set; } = string.Empty;
        
        public string? AttachmentPath { get; set; }

        public bool IsSigned { get; set; } = false;

        public bool IsDispensed { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public ICollection<Medicine> Medicines { get; set; } = new List<Medicine>();
    }

    public class Medicine
    {
        [Key]
        public int MedicineId { get; set; }

        public int PrescriptionId { get; set; }
        
        [ForeignKey("PrescriptionId")]
        public Prescription? Prescription { get; set; }

        public string Name { get; set; } = string.Empty;
        public string Dosage { get; set; } = string.Empty;
        public string Frequency { get; set; } = string.Empty;
        public string Duration { get; set; } = string.Empty;
    }
}
