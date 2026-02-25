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
        <div className="print-only hidden print:block p-8 bg-white text-slate-900 font-sans" id="printable-prescription">
            {/* Header / Letterhead */}
            {/* Clinic Letterhead */}
            <div className="border-b-2 border-blue-900 pb-4 mb-6">
                <div className="flex items-start justify-between">
                    {/* Left – Telugu + English */}
                    <div className="max-w-[45%]">
                        <p className="text-red-700 font-bold text-sm leading-snug" style={{ fontFamily: "'Noto Sans Telugu', sans-serif" }}>
                            మనీష న్యూరో సైకియాట్రిక్ క్లినిక్ &amp; కౌన్సెలింగ్ సెంటర్
                        </p>
                        <p className="text-blue-900 font-black text-[11px] uppercase tracking-wide mt-1">
                            MANISHA NEURO PSYCHIATRIC CLINIC &amp; COUNSELLING CENTRE
                        </p>
                        <p className="text-red-700 font-bold text-xs mt-2" style={{ fontFamily: "'Noto Sans Telugu', sans-serif" }}>
                            డా॥ బి.ఎస్.జి. వశిష్ఠ
                        </p>
                        <p className="text-blue-900 text-[10px] mt-0.5 leading-relaxed">
                            ఎం.బి.బి.ఎస్, డి.పి.యం. (ఉస్మానియా)<br />
                            కన్సల్టెంట్ న్యూరో సైకియాట్రిస్ట్<br />
                            రిజిస్ట్రేషన్ నెం. 65349<br />
                            హెచ్.నెం. 6-2-305, పింజార్ల స్ట్రీట్,<br />
                            హనుమాన్ టెంపుల్ దగ్గర,<br />
                            చౌరాస్తా నుండి హనుమాన్ టెంపుల్ రోడ్,<br />
                            హన్మకొండ.
                        </p>
                    </div>

                    {/* Center – Brain logo placeholder */}
                    <div className="flex flex-col items-center justify-center px-4">
                        <div className="w-16 h-16 rounded-full border-2 border-blue-800 flex items-center justify-center text-blue-800 text-3xl font-serif">🧠</div>
                        <div className="mt-2 border border-blue-800 rounded px-3 py-1 text-[9px] font-bold text-blue-800 text-center whitespace-nowrap">
                            Timings : 11-00 a.m. to 7-00 p.m.
                        </div>
                    </div>

                    {/* Right – English details */}
                    <div className="max-w-[40%] text-right">
                        <p className="text-blue-900 font-black text-base">Dr. B.S.G. VASISTA</p>
                        <p className="text-blue-900 text-[10px] leading-relaxed mt-1">
                            M.B.B.S., DPM (Osm)<br />
                            Consultant Neuro Psychiatrist<br />
                            Regd. No. 65349<br />
                            H.No. 6-2-305, Pinjarla Street,<br />
                            Near Hanuman Temple,<br />
                            Chowrasta to Hanuman Temple Road,<br />
                            Hanamkonda.<br />
                            Cell : 94907 55000, 73827 55000
                        </p>
                    </div>
                </div>
            </div>

            {/* Prescription Info Info Bar */}
            <div className="grid grid-cols-2 gap-8 mb-8">
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
                                    <td className="py-6">
                                        <p className="font-black text-lg">{med.name}</p>
                                        <p className="text-sm font-bold text-slate-500 italic mt-1">{med.dosage || med.dose || '500mg'}</p>
                                    </td>
                                    <td className="py-6 font-bold text-lg">{med.frequency || '1-0-1'}</td>
                                    <td className="py-6 font-bold text-lg text-right">{med.duration || '5 Days'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Clinical Notes */}
                    <div className="mt-12 bg-slate-50 p-6 border-l-4 border-slate-900 italic">
                        <h3 className="not-italic text-xs font-black text-slate-400 uppercase mb-2 tracking-widest">Clinician Instructions</h3>
                        <p className="text-lg leading-relaxed">
                            {rx.notes || 'Take medications after meals. Avoid strenuous activity and ensure proper hydration.'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Footer / Signature Area */}
            <div className="mt-20 pt-10 border-t border-slate-200">
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
