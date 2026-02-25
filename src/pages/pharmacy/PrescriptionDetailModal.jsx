import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    Pill, Calendar, User, UserRound, Clock,
    MapPin, Phone, AlertCircle, FileText
} from "lucide-react";
import { format } from 'date-fns';

const PrescriptionDetailModal = ({ isOpen, onClose, rx, onDispense }) => {
    if (!rx) return null;

    const dateStr = rx.createdAt ? format(new Date(rx.createdAt), 'PPPP') : 'N/A';
    const patientName = rx.visit ? `${rx.visit.patientFirstName} ${rx.visit.patientLastName}` : (rx.patient_name || 'N/A');
    const uhid = rx.visit?.patientId || rx.uhid || 'N/A';
    const doctorName = rx.visit?.consultantDoctorName || rx.doctor_name || 'N/A';

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex justify-between items-start pe-6">
                        <div className="space-y-1">
                            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                                <FileText className="text-blue-600" />
                                Prescription Details
                            </DialogTitle>
                            <DialogDescription className="text-blue-600 font-semibold tracking-wide">
                                REF: {rx.prescriptionId || rx.id?.toUpperCase()}
                            </DialogDescription>
                        </div>
                        <Badge className={rx.priority === 'STAT' ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}>
                            {rx.priority || 'NORMAL'}
                        </Badge>
                    </div>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4 mt-4">
                    {/* Patient Info Section */}
                    <div className="space-y-4">
                        <h4 className="flex items-center gap-2 font-bold text-slate-900 border-b pb-2">
                            <User size={18} className="text-slate-400" />
                            Patient Information
                        </h4>
                        <div className="flex items-start gap-4 p-3 bg-slate-50 rounded-xl">
                            <Avatar className="h-12 w-12 bg-blue-100 border-2 border-white shadow-sm">
                                <AvatarFallback className="text-blue-700 font-bold">
                                    {patientName?.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                            </Avatar>
                            <div className="space-y-1">
                                <p className="font-bold text-lg text-slate-900 leading-none">{patientName}</p>
                                <p className="text-sm text-slate-500 font-medium tracking-tight">UHID: {uhid}</p>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    <Badge variant="outline" className="text-[10px] py-0">{rx.visit?.patientAge || '30'} Yrs</Badge>
                                    <Badge variant="outline" className="text-[10px] py-0">{rx.visit?.gender || 'Male'}</Badge>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2 px-1">
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                <MapPin size={14} />
                                <span>{rx.visit?.patientAddress || '123 Medical Drive, Springfield'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                <Phone size={14} />
                                <span>{rx.visit?.patientPhone || '+1 (555) 012-3456'}</span>
                            </div>
                            <div className="mt-2 p-2 bg-amber-50 rounded-lg text-xs text-amber-800 flex gap-2">
                                <AlertCircle size={14} className="flex-shrink-0" />
                                <p><strong>Allergies:</strong> {rx.allergies || 'Penicillin, Peanuts'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Doctor Info Section */}
                    <div className="space-y-4">
                        <h4 className="flex items-center gap-2 font-bold text-slate-900 border-b pb-2">
                            <UserRound size={18} className="text-slate-400" />
                            Prescribing Physician
                        </h4>
                        <div className="flex items-start gap-4 p-3 bg-teal-50 rounded-xl">
                            <Avatar className="h-12 w-12 bg-teal-100 border-2 border-white shadow-sm">
                                <AvatarFallback className="text-teal-700 font-bold">
                                    {doctorName?.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                            </Avatar>
                            <div className="space-y-1">
                                <p className="font-bold text-lg text-slate-900 leading-none">{doctorName}</p>
                                <p className="text-sm text-teal-700 font-medium">{rx.doctor_specialty || 'General Physician'}</p>
                                <p className="text-xs text-slate-500 mt-1">License: {rx.doctor_license || 'MC-123456'}</p>
                            </div>
                        </div>
                        <div className="space-y-2 px-1 text-sm text-slate-600">
                            <p className="flex items-center gap-2"><Calendar size={14} /> Prescribed: {dateStr}</p>
                            <p className="flex items-center gap-2"><Clock size={14} /> Duration: {rx.duration || '5 Days Course'}</p>
                        </div>
                    </div>
                </div>

                {/* Medications Table */}
                <div className="mt-6 space-y-4">
                    <h4 className="flex items-center gap-2 font-bold text-slate-900 border-b pb-2">
                        <Pill size={18} className="text-slate-400" />
                        Medications & Dosage
                    </h4>
                    <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b">
                                <tr>
                                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Medicine</th>
                                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Dosage</th>
                                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Frequency</th>
                                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Duration</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {rx.medicines?.map((med, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-4 py-3 font-semibold text-slate-900">{med.name}</td>
                                        <td className="px-4 py-3 text-sm text-slate-600">{med.dosage || med.dose || '500mg'}</td>
                                        <td className="px-4 py-3 text-sm text-slate-600">{med.frequency || '1-0-1 (After Food)'}</td>
                                        <td className="px-4 py-3 text-sm text-slate-600">{med.duration || '5 Days'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Notes */}
                <div className="mt-6 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                    <p className="text-xs font-bold text-blue-800 uppercase mb-2">Clinical Notes & Instructions</p>
                    <p className="text-sm text-slate-700 leading-relaxed italic">
                        "{rx.notes || 'Please follow the dosage strictly as prescribed.'}"
                    </p>
                </div>

                <DialogFooter className="mt-8 gap-3 sm:gap-0">
                    <Button variant="outline" onClick={onClose} className="rounded-xl px-8">Close</Button>
                    {!rx.isDispensed && (
                        <Button
                            className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl px-8"
                            onClick={() => onDispense(rx.prescriptionId || rx.id)}
                        >
                            Dispense Now
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default PrescriptionDetailModal;
