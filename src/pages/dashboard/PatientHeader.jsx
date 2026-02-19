import React from "react";
import { Phone, CheckCircle2, History, ChevronLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function PatientHeader({ patient, onShowHistory, onBack }) {
    if (!patient) return null;

    return (
        <div className="bg-white rounded-xl shadow-sm border p-6 flex flex-wrap gap-6 items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-2xl">
                    {patient.name?.charAt(0)}
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">{patient.name}</h2>
                    <div className="flex items-center gap-3 text-sm text-slate-500 mt-1 font-medium">
                        <span>{patient.gender}</span>
                        <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                        <span>{patient.age} yrs</span>
                        <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                        <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {patient.phone}</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <Button variant="outline" size="sm" onClick={onBack} className="hidden md:flex gap-1 text-slate-600 border-slate-200 hover:bg-slate-50">
                    <ChevronLeft className="w-4 h-4" />
                    Back to Queue
                </Button>
                <Button variant="outline" size="sm" onClick={onShowHistory} className="hidden md:flex">
                    <History className="w-4 h-4 mr-2" />
                    Past History
                </Button>

                <Badge variant="outline" className="px-3 py-1 bg-green-50 text-green-700 border-green-200 flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3" /> Active Visit
                </Badge>
                <Badge variant="secondary" className="text-xs">
                    {new Date().toLocaleDateString()}
                </Badge>
            </div>
        </div>
    );
}
