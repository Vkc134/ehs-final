import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Calendar, Phone, Mail, MapPin, Activity, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import axiosInstance from "@/api/axios";

// Helper for Age Calculation because API might not return it directly
const calculateAge = (dob) => {
    if (!dob) return "N/A";
    const birthDate = new Date(dob);
    const ageDifMs = Date.now() - birthDate.getTime();
    const ageDate = new Date(ageDifMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
};

export default function PatientDetailsModal({ open, onOpenChange, patient }) {
    const [history, setHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    useEffect(() => {
        if (open && patient?.patientId) {
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

    if (!patient) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0 overflow-hidden bg-white">
                <DialogHeader className="p-6 pb-2 shrink-0">
                    <DialogTitle className="flex items-center gap-3 text-2xl font-bold text-slate-800">
                        <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                            <User className="h-6 w-6" />
                        </div>
                        {patient.patientFirstName} {patient.patientLastName}
                        <span className="text-sm font-normal text-slate-500 bg-slate-100 px-2 py-1 rounded-md ml-2">
                            ID: {patient.patientId}
                        </span>
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
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Personal Information</h3>
                                <div className="grid grid-cols-2 gap-y-6 gap-x-12">
                                    <InfoItem icon={Calendar} label="Date of Birth" value={patient.dateOfBirth} />
                                    <InfoItem icon={Activity} label="Age" value={`${calculateAge(patient.dateOfBirth)} Years`} />
                                    <InfoItem icon={User} label="Gender" value={patient.gender} />
                                    <InfoItem icon={Activity} label="Blood Group" value={patient.bloodGroup || "N/A"} />
                                    <InfoItem icon={Phone} label="Phone Number" value={patient.phoneNumber} />
                                    <InfoItem icon={Mail} label="Email" value={patient.email || "N/A"} />
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-xl border shadow-sm">
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Address</h3>
                                <div className="flex gap-3">
                                    <MapPin className="h-5 w-5 text-slate-400 shrink-0" />
                                    <p className="text-slate-700 font-medium">{patient.address || "No address provided"}</p>
                                </div>
                            </div>
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
