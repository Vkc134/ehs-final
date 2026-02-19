using System.ComponentModel.DataAnnotations;

namespace CareConnect.Core.Entities
{
    public class ICD11Code
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Code { get; set; } = string.Empty;

        [Required]
        public string Description { get; set; } = string.Empty;
    }
}
