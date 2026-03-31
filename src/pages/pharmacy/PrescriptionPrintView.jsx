import React from 'react';
import { Pill, Activity, Calendar, Contact, MapPin, Phone } from 'lucide-react';
import { format } from 'date-fns';

const PrescriptionPrintView = ({ rx }) => {
    if (!rx) return null;

    const dateStr = rx.createdAt ? format(new Date(rx.createdAt), 'MMM dd, yyyy') : 'N/A';
    const patientName = rx.visit ? `${rx.visit.patientFirstName} ${rx.visit.patientLastName}` : (rx.patient_name || 'N/A');
    const uhid = rx.visit?.patientId || rx.uhid || 'P-001';
    const doctorName = rx.visit?.consultantDoctorName || rx.doctor_name || 'N/A';

    return (
        <div className="print-only hidden print:block bg-white text-slate-900 font-sans" id="printable-prescription" style={{ paddingTop: '65mm', paddingLeft: '25mm', paddingRight: '25mm' }}>

            {/* Header Area (Empty for Physical Letterhead) */}


            {/* Prescription Info Info Bar */}
            <div className="grid grid-cols-2 gap-8 mb-4">

                <div className="space-y-4">
                    <div className="bg-slate-50 p-4 border rounded-sm">
                        <h2 className="text-xs font-black text-slate-400 uppercase mb-2 tracking-widest">Patient Information</h2>
                        <p className="text-xl font-black">{patientName}</p>
                        <div className="grid grid-cols-2 gap-2 mt-2 text-sm font-bold">
                            <p>UHID: {uhid}</p>
                            <p>Age/Sex: {rx.visit?.patientAge || '30'}/{rx.visit?.gender || 'M'}</p>
                        </div>
                        <p className="text-xs mt-2 text-slate-600">Address: {rx.visit?.patientAddress || 'Springfield, USA'}</p>
                    </div>
                </div>
                <div className="space-y-4">
                    <div className="bg-slate-50 p-4 border rounded-sm">
                        <h2 className="text-xs font-black text-slate-400 uppercase mb-2 tracking-widest">Prescription Details</h2>
                        <p className="text-lg font-bold">RX REF: {rx.prescriptionId || rx.id?.toUpperCase()}</p>
                        <p className="text-sm font-bold mt-1">Date: {dateStr}</p>
                        <p className="text-sm font-bold text-red-600 mt-1">Priority: {rx.priority || 'NORMAL'}</p>
                    </div>
                </div>
            </div>

            {/* RX Symbol and Medications */}
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <span className="text-5xl font-serif italic font-black">Rx</span>
                    <div className="h-0.5 bg-slate-900 flex-1"></div>
                </div>

                <div className="min-h-[400px]">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b-2 border-slate-900">
                                <th className="py-4 text-sm font-black uppercase tracking-widest">Medication & Strength</th>
                                <th className="py-4 text-sm font-black uppercase tracking-widest">Frequency</th>
                                <th className="py-4 text-sm font-black uppercase tracking-widest text-right">Duration</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y border-b border-slate-200">
                            {rx.medicines?.map((med, idx) => (
                                <tr key={idx}>
                                    <td className="py-3">

                                        <p className="font-black text-lg">{med.name}</p>
                                        <p className="text-sm font-bold text-slate-500 italic mt-1">{med.dosage || med.dose || '500mg'}</p>
                                    </td>
                                    <td className="py-3 font-bold text-lg">{med.frequency || '1-0-1'}</td>
                                    <td className="py-3 font-bold text-lg text-right">{med.duration || '5 Days'}</td>

                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Clinical Notes */}
                    <div className="mt-6 bg-slate-50 p-4 border-l-4 border-slate-900 italic">
                        <h3 className="not-italic text-xs font-black text-slate-400 uppercase mb-2 tracking-widest">Clinician Instructions</h3>

                        <p className="text-lg leading-relaxed">
                            {rx.notes || 'Take medications after meals. Avoid strenuous activity and ensure proper hydration.'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Footer / Signature Area */}
            <div className="mt-10 pt-6 border-t border-slate-200">

                <div className="flex justify-between items-end">
                    <div className="space-y-1">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Prescribed By</p>
                        <p className="text-xl font-black">{doctorName}</p>
                        <p className="text-sm font-bold text-blue-600">{rx.doctor_specialty || 'Medical Specialist'}</p>
                        <p className="text-[10px] font-bold text-slate-500 mt-2">LICENSE NO: {rx.doctor_license || 'MC-123456'}</p>
                    </div>
                    <div className="text-center w-64">
                        <div className="h-16 flex items-center justify-center italic text-slate-300 font-serif text-2xl mb-2 opacity-50">
                            [Digital Signature]
                        </div>
                        <div className="border-t-2 border-slate-900 pt-2 font-black uppercase text-xs tracking-widest">
                            Authorized Signature
                        </div>
                    </div>
                </div>
            </div>

            {/* CSS for print behavior */}
            <style dangerouslySetInnerHTML={{
                __html: `
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-prescription, #printable-prescription * {
            visibility: visible;
          }
          #printable-prescription {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
        }
      `}} />
        </div>
    );
};

export default PrescriptionPrintView;
