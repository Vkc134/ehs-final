using System.ComponentModel.DataAnnotations;

namespace CareConnect.Core.Entities
{
    public class TechTalkSettings
    {
        [Key]
        public int Id { get; set; }

        /// <summary>Maximum number of registrations allowed.</summary>
        public int MaxCapacity { get; set; } = 50;

        /// <summary>Whether registrations are currently open.</summary>
        public bool IsOpen { get; set; } = true;

        /// <summary>Tracks when the capacity was last extended.</summary>
        public DateTime? LastExtendedAt { get; set; }

        /// <summary>How many slots were added in the most recent extension.</summary>
        public int LastExtensionAmount { get; set; } = 0;
    }
}
