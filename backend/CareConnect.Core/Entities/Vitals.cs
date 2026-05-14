using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CareConnect.Core.Entities
{
    public class Vitals
    {
        [Key]
        public int VitalsId { get; set; }

        [Required]
        public int VisitId { get; set; }

        [ForeignKey("VisitId")]
        public Visit? Visit { get; set; }

        public string BloodPressure { get; set; } = string.Empty;
        public string Pulse { get; set; } = string.Empty;
        public string Temperature { get; set; } = string.Empty;
        public string SpO2 { get; set; } = string.Empty;
        public string Weight { get; set; } = string.Empty;

        // New fields
        public string Height { get; set; } = string.Empty;
        public string BMI { get; set; } = string.Empty;
    }
}
