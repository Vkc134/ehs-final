using System.ComponentModel.DataAnnotations;

namespace CareConnect.Core.Entities
{
    public class TechTalkRegistration
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(150)]
        public string FullName { get; set; } = string.Empty;

        [Required]
        [MaxLength(200)]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MaxLength(15)]
        public string Phone { get; set; } = string.Empty;

        [Required]
        [MaxLength(200)]
        public string College { get; set; } = string.Empty;

        [Required]
        [MaxLength(10)]
        public string YearOfStudy { get; set; } = string.Empty; // "3rd" or "4th"

        [Required]
        [MaxLength(100)]
        public string PptTopic { get; set; } = string.Empty; // Career Plan / Project Idea / Technology of Interest

        [MaxLength(200)]
        public string ReferredBy { get; set; } = string.Empty;

        /// <summary>Server-relative path to the uploaded PPT file (e.g. /uploads/techtalk/abc.pptx)</summary>
        [MaxLength(500)]
        public string PptFilePath { get; set; } = string.Empty;

        /// <summary>Original filename the user uploaded (for display)</summary>
        [MaxLength(300)]
        public string PptOriginalName { get; set; } = string.Empty;

        public DateTime RegisteredAt { get; set; } = DateTime.UtcNow;
    }
}
