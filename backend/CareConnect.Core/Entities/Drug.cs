using System.ComponentModel.DataAnnotations;

namespace CareConnect.Core.Entities
{
    public class Drug
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Name { get; set; } = string.Empty;

        public string? DefaultDosage { get; set; }

        public string? DefaultFrequency { get; set; }
        
        public string? DefaultDuration { get; set; }
    }
}
