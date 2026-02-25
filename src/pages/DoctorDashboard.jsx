import React, { useEffect, useState } from "react";
import axiosInstance from "@/api/axios";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Clock, CheckCircle2, Stethoscope, ChevronRight, AlertCircle, Activity } from "lucide-react";
import DashboardLayout from "./dashboard/DashboardLayout";
import PatientHeader from "./dashboard/PatientHeader";
import VitalsSection from "./dashboard/VitalsSection";
import ChipInputSection from "./dashboard/ChipInputSection";
import PrescriptionTable from "./dashboard/PrescriptionTable";
import AdviceTestsSection from "./dashboard/AdviceTestsSection";
import SocialHistorySection from "./dashboard/SocialHistorySection";
import FamilyHistorySection from "./dashboard/FamilyHistorySection";
import FooterActions from "./dashboard/FooterActions";

import PrintPreview from "./dashboard/PrintPreview";
import PastVisitsModal from "./dashboard/PastVisitsModal";
import DiagnosisInput from "./dashboard/DiagnosisInput";
import PANSSForm from "./dashboard/PANSSForm";

/* ================= HELPERS ================= */
const calculateAge = (dob) => {
    if (!dob) return "N/A";
    return new Date().getFullYear() - new Date(dob).getFullYear();
};

export default function DoctorDashboard() {
    const { user } = useAuth();
    const [visits, setVisits] = useState([]);
    const [selectedVisit, setSelectedVisit] = useState(null);
    const [patient, setPatient] = useState(null);
    const [vitals, setVitals] = useState({});
    const [complaints, setComplaints] = useState([]);
    const [diagnosis, setDiagnosis] = useState([]);
    const [medicines, setMedicines] = useState([]);
    const [advice, setAdvice] = useState("");
    const [tests, setTests] = useState([]);
    const [nextVisit, setNextVisit] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [socialHistory, setSocialHistory] = useState({});
    const [familyHistory, setFamilyHistory] = useState([]);
    const [showPrintPreview, setShowPrintPreview] = useState(false);
    const [showHistory, setShowHistory] = useState(false);

    const [patientHistory, setPatientHistory] = useState([]);
    const [panssData, setPanssData] = useState({});

    // File Upload State
    const [isUploading, setIsUploading] = useState(false);
    const [attachmentPath, setAttachmentPath] = useState(null);
    const [attachmentName, setAttachmentName] = useState(null);


    /* ================= LOAD VISITS ================= */
    useEffect(() => {
        if (user) {
            loadVisits();
        }
    }, [user]);

    const [stats, setStats] = useState({ total: 0, pending: 0, completed: 0 });
    const [completedVisits, setCompletedVisits] = useState([]);
    const [showCompletedModal, setShowCompletedModal] = useState(false);
    const [previewData, setPreviewData] = useState(null); // For previewing past visits

    /* ================= LOAD VISITS ================= */
    useEffect(() => {
        if (user) {
            loadVisits();
        }
    }, [user]);

    const loadVisits = async () => {
        try {
            const res = await axiosInstance.get(`/visits`); // Fetch all, filter client-side for case-insensitivity
            const allVisits = res.data.map(v => ({
                ...v,
                complaints: typeof v.complaints === 'string' && v.complaints.startsWith("[") ? JSON.parse(v.complaints) : (v.complaints || []),
                diagnosis: typeof v.diagnosis === 'string' && v.diagnosis.startsWith("[") ? JSON.parse(v.diagnosis) : (v.diagnosis || []),
                tests: typeof v.tests === 'string' && v.tests.startsWith("[") ? JSON.parse(v.tests) : (v.tests || []),
                medicines: v.medicines || [],
                vitals: v.vitals || {}
            }));

            // Filter for TODAY & CURRENT DOCTOR (Case-Insensitive)
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(today.getDate() + 1);

            const doctorNameLower = user.name.toLowerCase();




            const todaysVisits = allVisits.filter(v => {
                // Date Check
                const d = new Date(v.createdAt.endsWith("Z") ? v.createdAt : v.createdAt + "Z");
                const isToday = d >= today && d < tomorrow;

                // Doctor Check (Case Insensitive)
                const isForMe = v.consultantDoctorName?.trim().toLowerCase() === doctorNameLower;

                // Status Check
                const isStatusMatch = v.status === "Vitals Recorded" || v.status === "Pending" || v.status === "Doctor Assigned";



                return isToday && isForMe;
            });

            // Calculate Stats
            const pending = todaysVisits.filter(v => v.status === "Vitals Recorded" || v.status === "Pending" || v.status === "Doctor Assigned");
            const completed = todaysVisits.filter(v => v.status === "Completed");

            setStats({
                total: todaysVisits.length,
                pending: pending.length,
                completed: completed.length
            });

            setVisits(pending); // "visits" state now strictly means ACTIVE visits for the table
            setCompletedVisits(completed);

        } catch (err) {
            console.error(err);
            toast.error("Failed to load visits");
        }
    };

    /* ================= OPEN CONSULT ================= */
    const openConsultation = async (visit) => {
        try {
            const [patientRes, vitalsRes, historyRes] = await Promise.all([
                axiosInstance.get(`/patients/${visit.patientId}`),
                axiosInstance.get(`/vitals/preview/${visit.visitId}`),
                axiosInstance.get(`/visits?patientId=${visit.patientId}`) // Fetch history
            ]);

            // Helper for parsing
            const safeParseArray = (val) => {
                if (!val) return [];
                if (Array.isArray(val)) return val;
                if (typeof val === 'string') {
                    try {
                        const trimmed = val.trim();
                        if (trimmed.startsWith("[")) return JSON.parse(trimmed);
                        return [trimmed]; // Treat as single item
                    } catch (e) {
                        console.warn("Failed to parse array:", val);
                        return [val];
                    }
                }
                return [];
            };

            setSelectedVisit(visit);


            // Filter history and PARSE JSON fields
            const history = historyRes.data
                .filter(v => v.visitId !== visit.visitId)
                .map(v => ({
                    ...v,
                    complaints: safeParseArray(v.complaints),
                    diagnosis: safeParseArray(v.diagnosis),
                    tests: safeParseArray(v.tests),
                    medicines: safeParseArray(v.medicines),
                    vitals: v.vitals || {}
                }));

            // Debug logs removed for production

            setShowHistory(false);

            const patientData = patientRes.data;
            const mappedPatient = {
                ...patientData,
                name: `${patientData.patientFirstName} ${patientData.patientLastName}`,
                phone: patientData.phoneNumber,
                age: calculateAge(patientData.dateOfBirth)
            };

            setPatient(mappedPatient);
            setPatientHistory(history);

            // Debug logs removed for production

            setVitals({
                bp: vitalsRes.data.bloodPressure || "",
                pulse: vitalsRes.data.pulse || "",
                temperature: vitalsRes.data.temperature || "",
                spo2: vitalsRes.data.spO2 || vitalsRes.data.spo2 || "",
                weight: vitalsRes.data.weight || "",
                height: vitalsRes.data.height || vitalsRes.data.Height || "", // Try both cases
                bmi: vitalsRes.data.bmi || vitalsRes.data.BMI || "",
            });
            // Show existing attachment if available
            setAttachmentPath(visit.attachmentPath || null);
        } catch (error) {
            console.error("Error opening consultation:", error);
            toast.error("Failed to load patient details");
        }
    };

    /* ================= SAVE ================= */
    const handleSave = async () => {
        if (!selectedVisit) return;

        setIsLoading(true);

        const payload = {
            visitId: selectedVisit.visitId,
            chiefComplaints: complaints.join(", "),
            diagnosis: diagnosis.join(", "),
            labInvestigations: tests.join(", "),
            notes: advice, // Mapped to 'notes' in backend DTO
            medicines: medicines.map(m => ({
                name: m.name,
                dosage: m.dosage,
                frequency: m.frequency,

                duration: m.duration
            })),
            // Attachment is now handled via Visit, but keeping for backward capability if needed or removing if backend ignores
            // attachmentPath: attachmentPath 
        };

        try {
            await axiosInstance.post("/prescriptions", payload);
            toast.success("Prescription saved");
        } catch (err) {
            console.error("Prescription Save Error:", err);
            if (err.response && err.response.data) {
                console.error("Backend Details:", err.response.data);
            }
            toast.error("Failed to save prescription");
        } finally {
            setIsLoading(false);
        }
    };

    /* ================= SIGN OFF ================= */
    const handleEndConsultation = async () => {
        if (!selectedVisit) return;

        setIsLoading(true);

        try {
            // First create/save
            const payload = {
                visitId: selectedVisit.visitId,
                chiefComplaints: complaints.join(", "),
                diagnosis: diagnosis.join(", "),
                labInvestigations: tests.join(", "),
                notes: advice,
                medicines: medicines.map(m => ({
                    name: m.name,
                    dosage: m.dosage,
                    frequency: m.frequency,
                    duration: m.duration
                }))
            };

            const res = await axiosInstance.post("/prescriptions", payload);
            const prescriptionId = res.data.id;

            if (prescriptionId) {
                await axiosInstance.patch(`/prescriptions/${prescriptionId}/sign-off`);
                toast.success("Visit completed");
                loadVisits();
                setSelectedVisit(null);
                // Reset states
                setPatient(null);
                setVitals({});
                setComplaints([]);
                setDiagnosis([]);
                setMedicines([]);
                setAdvice("");
                setTests([]);
                setPanssData({});

            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to complete visit");
        } finally {
            setIsLoading(false);
        }
    };

    /* ================= PAST VISIT COPY HANDLERS ================= */

    const handleCopyMedicine = (medicine) => {
        setMedicines((prev) => [...prev, {
            ...medicine,
            id: Date.now() + Math.random(), // Safer unique ID
            type: medicine.type || "Tab",
            when: medicine.when || "After Food",
            notes: medicine.notes || ""
        }]);
        toast.success("Medicine added from past visit");
    };

    const handleCopyAllMedicines = (medicinesList) => {
        const cloned = medicinesList.map((m) => ({
            ...m,
            id: Date.now() + Math.random(),
            type: m.type || "Tab",
            when: m.when || "After Food",
            notes: m.notes || ""
        }));
        setMedicines((prev) => [...prev, ...cloned]);
        toast.success("All medicines copied from past visit");
    };

    const handleCopyVisit = (visit) => {
        handleCopyAllMedicines(visit.medicines || []);
        // Ensure these are arrays to prevent crashes in UI inputs
        setComplaints(Array.isArray(visit.complaints) ? visit.complaints : []);
        setDiagnosis(Array.isArray(visit.diagnosis) ? visit.diagnosis : []);
        setAdvice(visit.advice || "");
        setTests(Array.isArray(visit.tests) ? visit.tests : []);
        toast.success("Visit data copied successfully");
    };


    /* ================= UI ================= */
    if (!selectedVisit) {
        const statCards = [
            {
                label: "Today's Patients",
                value: stats.total,
                icon: Users,
                gradient: "from-blue-500 to-indigo-600",
                bg: "from-blue-50 to-indigo-50",
                border: "border-blue-100",
                text: "text-blue-700",
            },
            {
                label: "Pending",
                value: stats.pending,
                icon: Clock,
                gradient: "from-amber-400 to-orange-500",
                bg: "from-amber-50 to-orange-50",
                border: "border-amber-100",
                text: "text-amber-700",
                pulse: true,
            },
            {
                label: "Completed",
                value: stats.completed,
                icon: CheckCircle2,
                gradient: "from-emerald-400 to-teal-500",
                bg: "from-emerald-50 to-teal-50",
                border: "border-emerald-100",
                text: "text-emerald-700",
                onClick: () => setShowCompletedModal(true),
                sub: "View History →",
            },
        ];

        return (
            <DashboardLayout>
                <motion.div
                    className="p-6 space-y-8"
                    initial="hidden"
                    animate="visible"
                    variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
                >
                    {/* GREETING */}
                    <motion.div
                        variants={{ hidden: { opacity: 0, y: -20 }, visible: { opacity: 1, y: 0 } }}
                        transition={{ type: "spring", stiffness: 80 }}
                        className="flex items-center gap-3"
                    >
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-200">
                            <Stethoscope className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-slate-800">Good Day, {user?.name?.split(" ")[0]}!</h1>
                            <p className="text-sm text-slate-400 font-medium">Here's your patient queue for today</p>
                        </div>
                    </motion.div>

                    {/* STAT CARDS */}
                    <motion.div
                        variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                        transition={{ type: "spring", stiffness: 80 }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-5"
                    >
                        {statCards.map((card, i) => (
                            <motion.div
                                key={i}
                                whileHover={{ scale: 1.03, y: -3 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={card.onClick}
                                className={`relative overflow-hidden bg-gradient-to-br ${card.bg} border ${card.border} rounded-2xl p-6 shadow-sm ${card.onClick ? "cursor-pointer" : ""}`}
                            >
                                <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${card.gradient} shadow-md mb-4`}>
                                    <card.icon className="h-5 w-5 text-white" />
                                </div>
                                <p className={`text-xs font-bold uppercase tracking-widest ${card.text} flex items-center gap-2`}>
                                    {card.pulse && (
                                        <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute h-2 w-2 rounded-full bg-amber-400 opacity-75" />
                                            <span className="h-2 w-2 rounded-full bg-amber-500" />
                                        </span>
                                    )}
                                    {card.label}
                                </p>
                                <p className="text-4xl font-black text-slate-800 mt-1">{card.value}</p>
                                {card.sub && <p className={`text-xs font-semibold mt-2 ${card.text}`}>{card.sub}</p>}
                                <div className={`absolute -right-6 -bottom-6 h-24 w-24 rounded-full bg-gradient-to-br ${card.gradient} opacity-10`} />
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* VISIT QUEUE */}
                    <motion.div
                        variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                        transition={{ type: "spring", stiffness: 80 }}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Activity className="h-5 w-5 text-blue-500" />
                                <h2 className="text-lg font-black text-slate-800">Visits Awaiting Consultation</h2>
                            </div>
                            <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">
                                {visits.length} in queue
                            </span>
                        </div>

                        <div className="space-y-3">
                            <AnimatePresence>
                                {visits.length === 0 ? (
                                    <motion.div
                                        key="empty"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="text-center py-16 bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl border border-dashed border-blue-200"
                                    >
                                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 mx-auto mb-4">
                                            <CheckCircle2 className="h-8 w-8 text-blue-400" />
                                        </div>
                                        <p className="text-slate-500 font-bold text-lg">All clear!</p>
                                        <p className="text-sm text-slate-400 mt-1">No pending visits for today.</p>
                                    </motion.div>
                                ) : (
                                    visits.map((v, i) => (
                                        <motion.div
                                            key={v.visitId}
                                            initial={{ opacity: 0, x: -30 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 30 }}
                                            transition={{ type: "spring", stiffness: 100, delay: i * 0.06 }}
                                            whileHover={{ scale: 1.01, boxShadow: "0 8px 30px rgba(59,130,246,0.12)" }}
                                            className="flex justify-between items-center bg-white p-5 rounded-2xl border border-slate-100 shadow-sm"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md text-white font-black text-lg">
                                                    {(v.patientName || `P${v.patientId}`)[0]}
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-800">{v.patientName || `Patient #${v.patientId}`}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-xs font-semibold text-slate-400">Visit #{v.visitId}</span>
                                                        <span className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${v.priority === "Emergency"
                                                            ? "bg-red-100 text-red-600"
                                                            : "bg-green-100 text-green-600"
                                                            }`}>
                                                            {v.priority === "Emergency" && <AlertCircle className="h-3 w-3" />}
                                                            {v.priority || "Normal"}
                                                        </span>
                                                        <span className="flex items-center gap-1 text-xs font-semibold text-slate-400">
                                                            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                                                            {v.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-200 text-sm"
                                                onClick={() => openConsultation(v)}
                                            >
                                                Consult <ChevronRight className="h-4 w-4" />
                                            </motion.button>
                                        </motion.div>
                                    ))
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>

                    {/* COMPLETED VISITS MODAL */}
                    <PastVisitsModal
                        open={showCompletedModal}
                        onOpenChange={setShowCompletedModal}
                        visits={completedVisits}
                        onCopyVisit={(visit) => {
                            const preview = {
                                patient: {
                                    name: visit.patientName,
                                    id: visit.patientId,
                                    visitDate: new Date(visit.createdAt).toLocaleDateString()
                                },
                                vitals: visit.vitals || {},
                                complaints: visit.complaints || [],
                                diagnosis: visit.diagnosis || [],
                                medicines: visit.medicines || [],
                                advice: visit.advice || "",
                                tests: visit.tests || [],
                                familyPedigree: [],
                                socialHistory: {},
                                panssData: visit.panssData || null
                            };
                            setPreviewData(preview);
                            setShowPrintPreview(true);
                        }}
                        customActionLabel="Preview Treatment"
                    />

                    <PrintPreview
                        open={showPrintPreview && !!previewData}
                        onOpenChange={(open) => {
                            setShowPrintPreview(open);
                            if (!open) setPreviewData(null);
                        }}
                        patient={previewData?.patient}
                        vitals={previewData?.vitals || {}}
                        complaints={previewData?.complaints || []}
                        diagnosis={previewData?.diagnosis || []}
                        medicines={previewData?.medicines || []}
                        advice={previewData?.advice || ""}
                        tests={previewData?.tests || []}
                        familyPedigree={previewData?.familyPedigree || []}
                        socialHistory={previewData?.socialHistory || {}}
                        panssData={previewData?.panssData || null}
                    />

                </motion.div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-[1600px] mx-auto space-y-4 pb-20">

                {/* Patient Header */}
                <PatientHeader patient={patient} onShowHistory={() => setShowHistory(true)} onBack={() => setSelectedVisit(null)} />

                {/* Vitals */}
                <VitalsSection
                    initialVitals={vitals}
                    onVitalsChange={setVitals}
                />

                {/* Complaints + Diagnosis */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <ChipInputSection
                        title="Chief Complaints"
                        placeholder="Add complaint..."
                        initialItems={complaints}
                        onItemsChange={setComplaints}
                        color="red"
                    />

                    <DiagnosisInput
                        title="Diagnosis"
                        placeholder="Search ICD-11..."
                        initialItems={diagnosis}
                        onItemsChange={setDiagnosis}
                        color="blue"
                    />
                </div>

                {/* PANSS Rating Form */}
                <PANSSForm data={panssData} onChange={setPanssData} />

                <SocialHistorySection
                    initialData={socialHistory}
                    onDataChange={setSocialHistory}
                />
                <FamilyHistorySection
                    initialNodes={familyHistory}
                    onNodesChange={(data) => {
                        console.debug("Family callback data:", data);
                        setFamilyHistory(Array.isArray(data) ? data : []);
                    }}
                />

                {/* Medicines */}
                <PrescriptionTable
                    initialMedicines={medicines}
                    onMedicinesChange={setMedicines}
                />

                {/* Advice + Tests */}
                <AdviceTestsSection
                    initialAdvice={advice}
                    initialTests={tests}
                    onAdviceChange={setAdvice}
                    onTestsChange={setTests}
                    onNextVisitChange={setNextVisit}
                />

                {/* Actions */}
                <FooterActions
                    onSave={handleSave}
                    onEndConsultation={handleEndConsultation}
                    onPrint={() => setShowPrintPreview(true)}
                    isLoading={isLoading}
                    attachmentPath={attachmentPath}
                />

                {/* Print Preview Dialog */}
                <PrintPreview
                    open={showPrintPreview}
                    onOpenChange={(open) => {
                        setShowPrintPreview(open);
                        if (!open) setPreviewData(null); // Clear preview data on close
                    }}
                    patient={previewData?.patient || patient}
                    vitals={previewData?.vitals || vitals}
                    complaints={previewData?.complaints || complaints}
                    diagnosis={previewData?.diagnosis || diagnosis}
                    medicines={previewData?.medicines || medicines}
                    advice={previewData?.advice || advice}
                    tests={previewData?.tests || tests}
                    nextVisit={previewData?.nextVisit || nextVisit}
                    familyPedigree={previewData?.familyPedigree || familyHistory}
                    socialHistory={previewData?.socialHistory || socialHistory}
                    panssData={previewData?.panssData || panssData}
                />

                {/* Past History Modal */}
                <PastVisitsModal
                    open={showHistory}
                    onOpenChange={setShowHistory}
                    visits={patientHistory}
                    onCopyMedicine={handleCopyMedicine}
                    onCopyAllMedicines={handleCopyAllMedicines}
                    onCopyVisit={handleCopyVisit}
                />

            </div>
        </DashboardLayout>
    );

}
