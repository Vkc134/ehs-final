namespace CareConnect.Core.DTOs
{
    public class PrescriptionDto
    {
        public int PrescriptionId { get; set; }
        public int VisitId { get; set; }
        public string Notes { get; set; } = string.Empty;
        public bool IsSigned { get; set; }
        public bool IsDispensed { get; set; }
        public DateTime CreatedAt { get; set; }

        public string? AttachmentPath { get; set; }
        public List<MedicineDto> Medicines { get; set; } = new List<MedicineDto>();
        public PrescriptionVisitDto Visit { get; set; } = new();
    }

    public class PrescriptionVisitDto
    {
        public int PatientId { get; set; }
        public string PatientFirstName { get; set; } = string.Empty;
        public string PatientLastName { get; set; } = string.Empty;
        public string Gender { get; set; } = string.Empty;
        public string PatientAge { get; set; } = string.Empty;
        public string PatientAddress { get; set; } = string.Empty;
        public string PatientPhone { get; set; } = string.Empty;
        public string ConsultantDoctorName { get; set; } = string.Empty;
    }

    public class MedicineDto
    {
        public string Name { get; set; } = string.Empty;
        public string Dosage { get; set; } = string.Empty;
        public string Frequency { get; set; } = string.Empty;
        public string Duration { get; set; } = string.Empty;
    }

    public class CreatePrescriptionDto
    {
        public int VisitId { get; set; }
        public string Notes { get; set; } = string.Empty; // Maps to Advice
        public string ChiefComplaints { get; set; } = string.Empty;
        public string Diagnosis { get; set; } = string.Empty;
        public string LabInvestigations { get; set; } = string.Empty;

        public string? AttachmentPath { get; set; }
        public List<MedicineDto> Medicines { get; set; } = new List<MedicineDto>();
    }
}
