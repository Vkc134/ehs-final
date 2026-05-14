import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Pill, Printer, Eye, CheckCircle2, AlertCircle, Clock, Calendar, Activity } from "lucide-react";
import { format } from 'date-fns';

const TypeBadge = ({ type }) => {
    const styles = {
        URGENT: "bg-amber-100 text-amber-700 border-amber-200",
        STAT: "bg-red-100 text-red-700 border-red-200",
        NORMAL: "bg-slate-100 text-slate-700 border-slate-200",
    };
    return (
        <Badge variant="outline" className={`${styles[type] || styles.NORMAL} font-bold text-[10px] px-2 py-0`}>
            {type}
        </Badge>
    );
};

const StatusBadge = ({ status }) => {
    const styles = {
        "Pending": "bg-amber-500 text-white rounded-full px-4 h-7 flex items-center gap-2",
        "Fully Dispensed": "bg-emerald-500 text-white rounded-full px-4 h-7 flex items-center gap-2",
        "Partially Dispensed": "bg-blue-500 text-white rounded-full px-4 h-7 flex items-center gap-2",
        "Completed": "bg-emerald-600 text-white rounded-full px-4 h-7 flex items-center gap-2",
    };

    const icons = {
        "Pending": Clock,
        "Fully Dispensed": CheckCircle2,
        "Partially Dispensed": Activity,
        "Completed": CheckCircle2,
    };

    const Icon = icons[status] || AlertCircle;

    return (
        <div className={`${styles[status] || styles.Pending} text-xs font-medium`}>
            <Icon size={14} />
            {status}
        </div>
    );
};

const PrescriptionCard = ({ rx, onDispense, onView, onPrint }) => {
    const dateStr = rx.createdAt ? format(new Date(rx.createdAt), 'MMM dd, yyyy') : 'N/A';
    const rxType = rx.priority || 'NORMAL';

    const patientName = rx.visit ? `${rx.visit.patientFirstName} ${rx.visit.patientLastName}` : (rx.patient_name || 'N/A');
    const uhid = rx.visit?.patientId || rx.uhid || 'N/A';
    const doctorName = rx.visit?.consultantDoctorName || rx.doctor_name || 'N/A';

    return (
        <Card className="mb-4 hover:shadow-md transition-shadow">
            <CardContent className="p-0">
                <div className="grid grid-cols-12 items-center p-4 gap-4">

                    {/* Prescription Info */}
                    <div className="col-span-2 space-y-1">
                        <h4 className="font-bold text-sm text-slate-900">{rx.prescriptionId || rx.id?.slice(0, 10).toUpperCase()}</h4>
                        <div className="flex items-center gap-2">
                            <TypeBadge type={rxType} />
                        </div>
                        <p className="text-[11px] text-slate-500 flex items-center gap-1">
                            <Calendar size={12} /> {dateStr}
                        </p>
                    </div>

                    {/* Patient Info */}
                    <div className="col-span-2 flex items-center gap-3">
                        <Avatar className="h-9 w-9 bg-blue-50">
                            <AvatarFallback className="text-blue-600 text-xs">
                                {patientName?.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                        </Avatar>
                        <div className="space-y-0.5">
                            <p className="text-sm font-semibold">{patientName}</p>
                            <p className="text-[11px] text-slate-500">ID: {uhid}</p>
                        </div>
                    </div>

                    {/* Doctor Info */}
                    <div className="col-span-2 flex items-center gap-3">
                        <Avatar className="h-9 w-9 bg-teal-50">
                            <AvatarFallback className="text-teal-600 text-xs">
                                {doctorName?.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                        </Avatar>
                        <div className="space-y-0.5">
                            <p className="text-sm font-semibold">{doctorName}</p>
                            <p className="text-[11px] text-slate-500">{rx.doctor_specialty || 'General Medicine'}</p>
                        </div>
                    </div>

                    {/* Medications */}
                    <div className="col-span-2 space-y-1">
                        <div className="flex items-center gap-2 text-slate-700">
                            <Pill size={14} className="text-blue-500" />
                            <span className="text-sm font-semibold">{rx.medicines?.length || 0} medications</span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate max-w-[150px]">
                            {rx.medicines?.map(m => m.name).join(', ') || 'No medications listed'}
                        </p>
                    </div>

                    {/* Status */}
                    <div className="col-span-2">
                        <StatusBadge status={rx.isDispensed ? "Fully Dispensed" : "Pending"} />
                    </div>

                    {/* Actions */}
                    <div className="col-span-2 flex justify-end gap-2">
                        <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => onView(rx)}>
                            <Eye size={18} className="text-slate-600" />
                        </Button>
                        <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => onPrint(rx)}>
                            <Printer size={18} className="text-slate-600" />
                        </Button>
                        {!rx.isDispensed && (
                            <Button
                                className="h-9 bg-teal-500 hover:bg-teal-600 text-white flex gap-2 pl-3 pr-4"
                                onClick={() => onDispense(rx.prescriptionId || rx.id)}
                            >
                                <Pill size={16} />
                                <span>Dispense</span>
                            </Button>
                        )}
                    </div>

                </div>
            </CardContent>
        </Card>
    );
};

export default PrescriptionCard;
