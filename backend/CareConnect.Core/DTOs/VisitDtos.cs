namespace CareConnect.Core.DTOs
{
    public class VisitDto
    {
        public int VisitId { get; set; }
        public int PatientId { get; set; }
        public string PatientName { get; set; } = string.Empty; // Computed for easier frontend display
        public string ConsultantDoctorName { get; set; } = string.Empty;
        public string Priority { get; set; } = "Normal";
        public string Status { get; set; } = "Pending";
        public DateTime CreatedAt { get; set; }
        public string? AttachmentPath { get; set; }

        public string Complaints { get; set; } = "[]";
        public string Diagnosis { get; set; } = "[]";
        public string Advice { get; set; } = "";
        public string Tests { get; set; } = "[]";

        public VitalsDto? Vitals { get; set; }
        public List<MedicineDto> Medicines { get; set; } = new();
    }

    public class CreateVisitDto
    {
        public int PatientId { get; set; }
        public string ConsultantDoctorName { get; set; } = string.Empty;
        public string Priority { get; set; } = "Normal";
    }

    public class UpdateVisitStatusDto
    {
        public string Status { get; set; } = string.Empty;
    }

    public class UpdateVisitAttachmentDto
    {
        public string AttachmentPath { get; set; } = string.Empty;
    }

    public class CreateVitalsDto
    {
        public int VisitId { get; set; }
        public string BloodPressure { get; set; } = string.Empty;
        public string Pulse { get; set; } = string.Empty;
        public string Temperature { get; set; } = string.Empty;
        public string SpO2 { get; set; } = string.Empty;
        public string Weight { get; set; } = string.Empty;
        public string Height { get; set; } = string.Empty;
        public string BMI { get; set; } = string.Empty;
    }
    
    public class VitalsDto : CreateVitalsDto
    {
        public int VitalsId { get; set; }
    }
}
