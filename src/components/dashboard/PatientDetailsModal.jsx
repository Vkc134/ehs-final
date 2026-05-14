import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { User, Calendar, Phone, Mail, MapPin, Activity, Clock, Pencil, X, Save, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import axiosInstance from "@/api/axios";
import { toast } from "sonner";

// Helper for Age Calculation because API might not return it directly
const calculateAge = (dob) => {
    if (!dob) return "N/A";
    const birthDate = new Date(dob);
    const ageDifMs = Date.now() - birthDate.getTime();
    const ageDate = new Date(ageDifMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
};

// Calculate approximate DOB from age
const dobFromAge = (age) => {
    const year = new Date().getFullYear() - parseInt(age);
    return `${year}-01-01`;
};

export default function PatientDetailsModal({ open, onOpenChange, patient, onPatientUpdated }) {
    const [history, setHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editForm, setEditForm] = useState({});

    // Reset edit mode when modal opens/closes or patient changes
    useEffect(() => {
        if (open && patient) {
            setIsEditing(false);
            setEditForm({
                patientFirstName: patient.patientFirstName || "",
                patientLastName: patient.patientLastName || "",
                dateOfBirth: patient.dateOfBirth || "",
                age: calculateAge(patient.dateOfBirth)?.toString() || "",
                gender: patient.gender || "",
                phoneNumber: patient.phoneNumber || "",
                email: patient.email || "",
                address: patient.address || "",
                bloodGroup: patient.bloodGroup || "",
                isVyasa: patient.isVyasa ?? null,
            });
            fetchHistory();
        }
    }, [open, patient]);

    const fetchHistory = async () => {
        try {
            setLoadingHistory(true);
            const res = await axiosInstance.get(`/visits?patientId=${patient.patientId}`);
            setHistory(res.data);
        } catch (error) {
            console.error("Failed to fetch history", error);
        } finally {
            setLoadingHistory(false);
        }
    };

    const handleSave = async () => {
        if (!editForm.patientFirstName || !editForm.phoneNumber) {
            toast.error("First Name and Phone Number are required.");
            return;
        }

        setIsSaving(true);
        try {
            // Calculate DOB from age if age was edited
            const dob = editForm.age ? dobFromAge(editForm.age) : editForm.dateOfBirth;

            const payload = {
                patientFirstName: editForm.patientFirstName,
                patientLastName: editForm.patientLastName,
                dateOfBirth: dob,
                gender: editForm.gender,
                phoneNumber: editForm.phoneNumber,
                email: editForm.email,
                address: editForm.address,
                bloodGroup: editForm.bloodGroup,
                isVyasa: editForm.isVyasa,
            };

            const res = await axiosInstance.put(`/patients/${patient.patientId}`, payload);
            toast.success("Patient details updated successfully!");
            setIsEditing(false);

            // Notify parent to refresh the patients list and update the selected patient
            if (onPatientUpdated) {
                onPatientUpdated(res.data || { ...patient, ...payload, dateOfBirth: dob });
            }
        } catch (error) {
            console.error("Failed to update patient:", error);
            toast.error("Failed to update patient details.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        // Reset form to original patient data
        setEditForm({
            patientFirstName: patient.patientFirstName || "",
            patientLastName: patient.patientLastName || "",
            dateOfBirth: patient.dateOfBirth || "",
            age: calculateAge(patient.dateOfBirth)?.toString() || "",
            gender: patient.gender || "",
            phoneNumber: patient.phoneNumber || "",
            email: patient.email || "",
            address: patient.address || "",
            bloodGroup: patient.bloodGroup || "",
            isVyasa: patient.isVyasa ?? null,
        });
        setIsEditing(false);
    };

    if (!patient) return null;

    return (
        <Dialog open={open} onOpenChange={(val) => {
            if (!val) setIsEditing(false);
            onOpenChange(val);
        }}>
            <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0 overflow-hidden bg-white">
                <DialogHeader className="p-6 pb-2 shrink-0">
                    <DialogTitle className="flex items-center gap-3 text-2xl font-bold text-slate-800">
                        <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                            <User className="h-6 w-6" />
                        </div>
                        <span className="flex-1">
                            {isEditing ? "Edit Patient" : `${patient.patientFirstName} ${patient.patientLastName}`}
                        </span>
                        <span className="text-sm font-normal text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                            ID: {patient.patientId}
                        </span>

                        {/* Edit / Cancel Toggle */}
                        {!isEditing ? (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsEditing(true)}
                                className="ml-2 gap-1.5 text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                            >
                                <Pencil className="h-3.5 w-3.5" />
                                Edit
                            </Button>
                        ) : (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleCancel}
                                className="ml-2 gap-1.5 text-slate-500 border-slate-200 hover:bg-slate-50 transition-colors"
                            >
                                <X className="h-3.5 w-3.5" />
                                Cancel
                            </Button>
                        )}
                    </DialogTitle>
                </DialogHeader>

                <Tabs defaultValue="overview" className="flex-1 flex flex-col overflow-hidden">
                    <div className="px-6 border-b">
                        <TabsList className="bg-transparent h-12 w-full justify-start gap-6 p-0">
                            <TabsTrigger
                                value="overview"
                                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none px-0 pb-3 font-semibold text-slate-500 data-[state=active]:text-blue-600"
                            >
                                Overview
                            </TabsTrigger>
                            <TabsTrigger
                                value="history"
                                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none px-0 pb-3 font-semibold text-slate-500 data-[state=active]:text-blue-600"
                            >
                                Visit History
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <div className="flex-1 overflow-y-auto bg-slate-50/50 p-6">
                        <TabsContent value="overview" className="mt-0 space-y-6">
                            {/* Personal Info Card */}
                            <div className="bg-white p-6 rounded-xl border shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Personal Information</h3>
                                    {isEditing && (
                                        <span className="text-xs text-blue-500 font-semibold bg-blue-50 px-2 py-1 rounded-full animate-pulse">
                                            ✏️ Editing
                                        </span>
                                    )}
                                </div>

                                {!isEditing ? (
                                    /* ── READ-ONLY VIEW ── */
                                    <div className="grid grid-cols-2 gap-y-6 gap-x-12">
                                        <InfoItem icon={Calendar} label="Date of Birth" value={patient.dateOfBirth} />
                                        <InfoItem icon={Activity} label="Age" value={`${calculateAge(patient.dateOfBirth)} Years`} />
                                        <InfoItem icon={User} label="Gender" value={patient.gender} />
                                        <InfoItem icon={Activity} label="Blood Group" value={patient.bloodGroup || "N/A"} />
                                        <InfoItem icon={Phone} label="Phone Number" value={patient.phoneNumber} />
                                        <InfoItem icon={Mail} label="Email" value={patient.email || "N/A"} />
                                        <InfoItem icon={User} label="Vyasa Patient" value={patient.isVyasa === true ? "Yes" : patient.isVyasa === false ? "No" : "N/A"} />
                                    </div>
                                ) : (
                                    /* ── EDIT VIEW ── */
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="edit-firstName" className="text-xs font-semibold text-slate-500 uppercase">First Name *</Label>
                                            <Input
                                                id="edit-firstName"
                                                value={editForm.patientFirstName}
                                                onChange={(e) => setEditForm({ ...editForm, patientFirstName: e.target.value })}
                                                className="rounded-lg border-slate-200 focus:border-blue-400 focus:ring-blue-400"
                                                placeholder="Enter first name"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label htmlFor="edit-lastName" className="text-xs font-semibold text-slate-500 uppercase">Last Name</Label>
                                            <Input
                                                id="edit-lastName"
                                                value={editForm.patientLastName}
                                                onChange={(e) => setEditForm({ ...editForm, patientLastName: e.target.value })}
                                                className="rounded-lg border-slate-200 focus:border-blue-400 focus:ring-blue-400"
                                                placeholder="Enter last name"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label htmlFor="edit-age" className="text-xs font-semibold text-slate-500 uppercase">Age</Label>
                                            <Input
                                                id="edit-age"
                                                type="number"
                                                value={editForm.age}
                                                onChange={(e) => setEditForm({ ...editForm, age: e.target.value })}
                                                className="rounded-lg border-slate-200 focus:border-blue-400 focus:ring-blue-400"
                                                placeholder="Enter age"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-semibold text-slate-500 uppercase">Gender</Label>
                                            <Select
                                                value={editForm.gender}
                                                onValueChange={(v) => setEditForm({ ...editForm, gender: v })}
                                            >
                                                <SelectTrigger className="rounded-lg border-slate-200">
                                                    <SelectValue placeholder="Select gender" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-popover border-border">
                                                    <SelectItem value="Male">Male</SelectItem>
                                                    <SelectItem value="Female">Female</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label htmlFor="edit-phone" className="text-xs font-semibold text-slate-500 uppercase">Phone Number *</Label>
                                            <Input
                                                id="edit-phone"
                                                value={editForm.phoneNumber}
                                                onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                                                className="rounded-lg border-slate-200 focus:border-blue-400 focus:ring-blue-400"
                                                placeholder="Enter phone number"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label htmlFor="edit-email" className="text-xs font-semibold text-slate-500 uppercase">Email</Label>
                                            <Input
                                                id="edit-email"
                                                type="email"
                                                value={editForm.email}
                                                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                                className="rounded-lg border-slate-200 focus:border-blue-400 focus:ring-blue-400"
                                                placeholder="Enter email"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-semibold text-slate-500 uppercase">Blood Group</Label>
                                            <Select
                                                value={editForm.bloodGroup}
                                                onValueChange={(v) => setEditForm({ ...editForm, bloodGroup: v })}
                                            >
                                                <SelectTrigger className="rounded-lg border-slate-200">
                                                    <SelectValue placeholder="Select blood group" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-popover border-border">
                                                    {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((bg) => (
                                                        <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-semibold text-slate-500 uppercase">Vyasa Patient</Label>
                                            <Select
                                                value={editForm.isVyasa === true ? "true" : editForm.isVyasa === false ? "false" : ""}
                                                onValueChange={(v) => setEditForm({ ...editForm, isVyasa: v === "true" })}
                                            >
                                                <SelectTrigger className="rounded-lg border-slate-200">
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-popover border-border">
                                                    <SelectItem value="true">Vyasa</SelectItem>
                                                    <SelectItem value="false">Non-Vyasa</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Address Card */}
                            <div className="bg-white p-6 rounded-xl border shadow-sm">
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Address</h3>
                                {!isEditing ? (
                                    <div className="flex gap-3">
                                        <MapPin className="h-5 w-5 text-slate-400 shrink-0" />
                                        <p className="text-slate-700 font-medium">{patient.address || "No address provided"}</p>
                                    </div>
                                ) : (
                                    <Textarea
                                        value={editForm.address}
                                        onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                                        className="rounded-lg border-slate-200 focus:border-blue-400 focus:ring-blue-400 resize-none"
                                        placeholder="Enter address"
                                        rows={3}
                                    />
                                )}
                            </div>

                            {/* Save / Cancel Actions (only in edit mode) */}
                            {isEditing && (
                                <div className="flex justify-end gap-3 pt-2">
                                    <Button
                                        variant="outline"
                                        onClick={handleCancel}
                                        className="rounded-xl px-6 gap-1.5"
                                        disabled={isSaving}
                                    >
                                        <X className="h-4 w-4" />
                                        Discard
                                    </Button>
                                    <Button
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        className="rounded-xl px-6 gap-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-200 hover:opacity-90 transition-opacity"
                                    >
                                        {isSaving ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="h-4 w-4" />
                                                Save Changes
                                            </>
                                        )}
                                    </Button>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="history" className="mt-0">
                            <div className="space-y-4">
                                {loadingHistory ? (
                                    <div className="text-center py-10 text-slate-400">Loading history...</div>
                                ) : history.length === 0 ? (
                                    <div className="text-center py-12 bg-white rounded-xl border border-dashed">
                                        <Clock className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                                        <p className="text-slate-500">No visit history found.</p>
                                    </div>
                                ) : (
                                    history.map((visit) => (
                                        <HistoryCard key={visit.visitId} visit={visit} />
                                    ))
                                )}
                            </div>
                        </TabsContent>
                    </div>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}

const InfoItem = ({ icon: Icon, label, value }) => (
    <div className="flex items-start gap-3">
        <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
            <Icon className="h-4 w-4" />
        </div>
        <div>
            <p className="text-xs font-semibold text-slate-400 uppercase">{label}</p>
            <p className="text-slate-900 font-medium mt-0.5">{value}</p>
        </div>
    </div>
);

const HistoryCard = ({ visit }) => {
    const date = new Date(visit.createdAt).toLocaleDateString(undefined, {
        weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
    });

    return (
        <div className="bg-white p-4 rounded-xl border shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
                <div>
                    <div className="font-bold text-slate-800 text-lg">Visit #{visit.visitId}</div>
                    <div className="text-sm text-slate-500 font-medium flex items-center gap-1.5 mt-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {date}
                    </div>
                </div>
                <div className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${visit.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                    {visit.status}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm border-t pt-3">
                <div>
                    <span className="text-slate-400 text-xs font-semibold uppercase block mb-1">Doctor</span>
                    <span className="font-medium text-slate-700">{visit.consultantDoctorName}</span>
                </div>
                <div>
                    <span className="text-slate-400 text-xs font-semibold uppercase block mb-1">Diagnosis</span>
                    <div className="flex flex-wrap gap-1">
                        {/* Safe parse diagnosis */}
                        {(() => {
                            try {
                                const d = typeof visit.diagnosis === 'string' && visit.diagnosis.startsWith('[')
                                    ? JSON.parse(visit.diagnosis)
                                    : Array.isArray(visit.diagnosis) ? visit.diagnosis : [];
                                return d.length > 0 ? d.map((diag, i) => (
                                    <span key={i} className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-xs font-medium truncate max-w-[150px]">{diag}</span>
                                )) : <span className="text-slate-400 italic">None</span>;
                            } catch { return <span className="text-slate-400 italic">None</span> }
                        })()}
                    </div>
                </div>
            </div>
        </div>
    );
};
