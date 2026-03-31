import { useState, useRef } from "react";
import { Printer, Plus, Minus, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

/* ======================================================
   PRINT PREVIEW – REFLECTING USER'S REQUESTED LAYOUT
====================================================== */

const PrintPreview = ({
    open,
    onOpenChange,
    patient = {},
    vitals = {},
    complaints = [],
    diagnosis = [],
    medicines = [],
    advice = "",
    tests = [],
    nextVisit = null,
    familyPedigree = [],
    socialHistory = {},
    panssData = null,
}) => {
    const printRef = useRef(null);

    /* ---------------- SECTIONS ---------------- */

    const [sections, setSections] = useState([
        { id: "header", label: "Patient Info", enabled: true },
        { id: "vitals", label: "Vitals", enabled: true },
        { id: "complaints", label: "Chief Complaints", enabled: true },
        { id: "diagnosis", label: "Diagnosis", enabled: true },
        { id: "prescription", label: "Prescription", enabled: true },
        { id: "family", label: "Family History", enabled: true },
        { id: "social", label: "Social History", enabled: true },
        { id: "panss", label: "PANSS Scale", enabled: true },
        { id: "advice", label: "Advice & Investigations", enabled: true },
    ]);

    const toggleSection = (id) =>
        setSections((prev) =>
            prev.map((s) =>
                s.id === id ? { ...s, enabled: !s.enabled } : s
            )
        );

    const isEnabled = (id) =>
        sections.find((s) => s.id === id)?.enabled ?? false;

    /* ---------------- PRINT ---------------- */

    const handlePrint = () => {
        if (!printRef.current) return;

        const win = window.open("", "_blank");
        if (!win) return;

        // Triple Lock: Set title to empty to avoid browser printing it in the header
        win.document.title = "";


        win.document.write(`
      <html>
        <head>
          <title>Prescription - ${patient?.name || ""}</title>

          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Noto+Sans+Telugu:wght@400;700&display=swap');
            
            @media print {
                @page { margin: 0 !important; }
            }

            body {
              font-family: 'Inter', sans-serif;
              padding: 0;
              margin: 0;
              font-size: 9.5px; /* Slightly smaller for single-page fit */
              color: #1e293b;
              background: white;
            }


            * { margin: 0; padding: 0; box-sizing: border-box; }
            
            .page-container {
                width: 210mm;
                min-height: 297mm;
                padding: 10mm 25mm 20mm 25mm; /* Increased side padding to 25mm */
                margin: 0 auto;
                margin-top: 65mm; /* Area for physical letterhead */
                position: relative;
                display: flex;
                flex-direction: column;
            }




            /* --- LETTERHEAD REMOVED --- */


            /* --- CONTENT LAYOUT --- */
            .section { margin-bottom: 10px; page-break-inside: avoid; }
            
            .section-title {
              font-size: 8.5px;
              font-weight: 800;
              color: #1e40af;
              text-transform: uppercase;
              letter-spacing: 0.1em;
              border-bottom: 1px solid #e2e8f0;
              padding-bottom: 2px;
              margin-bottom: 6px;
              display: flex;
              align-items: center;
              gap: 5px;
            }


            .patient-box {
                background: #f8fafc;
                padding: 8px 12px;
                border: 1px solid #e2e8f0;
                border-radius: 6px;
                display: flex;
                justify-content: space-between;
                margin-bottom: 10px;
            }

            .patient-name { font-size: 12px; font-weight: 800; color: #1e293b; }
            .patient-meta { font-size: 8.5px; font-weight: 700; color: #64748b; text-transform: uppercase; }


            .chip {
              display: inline-block;
              background: #f1f5f9;
              padding: 3px 8px;
              border-radius: 4px;
              font-size: 9px;
              font-weight: 700;
              margin-right: 4px;
              margin-bottom: 4px;
              border: 1px solid #e2e8f0;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 5px;
              font-size: 10px;
            }

            th {
                text-align: left;
                padding: 6px 8px;
                background: #f8fafc;
                color: #64748b;
                font-size: 8px;
                font-weight: 800;
                text-transform: uppercase;
                border-bottom: 1.5px solid #e2e8f0;
            }

            td {
                padding: 8px;
                border-bottom: 0.5px solid #f1f5f9;
            }

            .med-name { font-weight: 800; color: #0f172a; }
            .med-freq { color: #1e40af; font-weight: 700; }

            .vitals-grid {
                display: grid;
                grid-template-columns: repeat(5, 1fr);
                gap: 8px;
            }

            .vital-box {
                padding: 6px;
                border-radius: 4px;
                border: 1px solid #e2e8f0;
                text-align: center;
            }

            .vital-label { font-size: 7px; font-weight: 800; color: #94a3b8; }
            .vital-value { font-size: 11px; font-weight: 800; color: #1e293b; }

            .pedigree-container {
                background: #fcfcfc;
                padding: 10px;
                border-radius: 8px;
                border: 1px solid #f1f5f9;
            }

            .pedigree-row { display: flex; justify-content: center; gap: 15px; margin-top: 8px; }
            .pedigree-node { text-align: center; width: 50px; }
            .node-symbol { font-size: 16px; line-height: 1; }
            .node-m { color: #2563eb; }
            .node-f { color: #db2777; }
            .node-label { font-size: 6.5px; font-weight: 800; color: #64748b; text-transform: uppercase; }
            .node-info { font-size: 6.5px; color: #1e40af; font-weight: 600; }


            .footer-signature {
                margin-top: 20px;
                padding-top: 15px;
                display: flex;
                justify-content: flex-end;
            }


            .signature-text {
                font-size: 11px;
                font-weight: 700;
                font-style: italic;
                color: #1e293b;
                border-bottom: 1px solid #1e293b;
                padding-bottom: 1px;
                min-width: 120px;
                text-align: center;
            }

            @media print {
                .page-container { margin: 0; padding: 8mm 15mm 15mm 15mm; }
            }
          </style>
        </head>
        <body>
          <div class="page-container">
            <div class="main-content">
                ${printRef.current.innerHTML}
            </div>

            <div class="footer-signature">
                <div class="signature-text">Signature</div>
            </div>
          </div>
        </body>

      </html>
    `);

        win.document.close();
        win.focus();
        setTimeout(() => {
            win.print();
            win.close();
        }, 300);
    };

    /* ---------------- HELPERS ---------------- */

    const renderNode = (n) => {
        // Special logic for patient node symbols
        const rel = n.relation?.toLowerCase() || "";
        const isPatient = rel === "patient";
        const sym = (isPatient ? (patient?.gender === "Male" ? "♂" : "♀") : (n.gender === "Male" ? "♂" : "♀"));
        const colorClass = (isPatient ? (patient?.gender === "Male" ? "node-m" : "node-f") : (n.gender === "Male" ? "node-m" : "node-f"));

        return (
            <div key={n.id} className="pedigree-node">
                <div className={`node-symbol ${colorClass}`}>{sym}</div>
                {!n.isHealthy && <div style={{ color: "red", fontSize: 6, fontWeight: 800 }}>● AFFECTED</div>}
                <div className="node-label">{n.relation}</div>
                {n.condition && <div className="node-info">{n.condition}</div>}
            </div>
        );
    };

    /* ---------------- FAMILY GROUPING ---------------- */

    // Ensure familyPedigree is an array and filter out invalid nodes
    const safePedigree = Array.isArray(familyPedigree) ? familyPedigree : [];

    const patientNode = safePedigree.find(n => n.relation?.toLowerCase() === "patient");
    const matList = safePedigree.filter(n => n.relation?.toLowerCase()?.includes("maternal") || n.relation?.toLowerCase() === "mother");
    const patList = safePedigree.filter(n => n.relation?.toLowerCase()?.includes("paternal") || n.relation?.toLowerCase() === "father");
    const others = safePedigree.filter(n =>
        ["brother", "sister", "sibling", "son", "daughter", "child"].some(k => n.relation?.toLowerCase()?.includes(k))
    );

    /* ======================================================
       UI
    ====================================================== */

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-5xl max-h-[95vh] flex flex-col p-0 overflow-hidden bg-slate-50 border-none shadow-2xl">
                <DialogHeader className="p-6 bg-white border-b shrink-0">
                    <DialogTitle className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <span className="text-xl font-black text-slate-800">Prescription Preview</span>
                            <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border border-blue-200">
                                Single Page Auto-Fit Enabled
                            </div>
                        </div>
                        <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700 h-12 px-8 rounded-2xl shadow-xl shadow-blue-500/20 text-white font-black uppercase tracking-widest text-xs">
                            <Printer className="h-5 w-5 mr-3" />
                            Finalize & Print
                        </Button>
                    </DialogTitle>
                </DialogHeader>

                <div className="flex flex-1 overflow-hidden p-6 gap-6">
                    {/* TOGGLES SIDEBAR */}
                    <div className="w-64 bg-white rounded-[24px] border p-5 shadow-sm shrink-0 overflow-y-auto space-y-4">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">Data Layers</h3>
                        <div className="space-y-1.5">
                            {sections.map((s) => (
                                <button
                                    key={s.id}
                                    onClick={() => toggleSection(s.id)}
                                    className={cn(
                                        "w-full px-4 py-2.5 flex items-center justify-between rounded-xl text-[12px] font-bold transition-all",
                                        s.enabled
                                            ? "bg-blue-50 text-blue-700 border border-blue-100"
                                            : "bg-slate-50 text-slate-400 border border-transparent opacity-60"
                                    )}
                                >
                                    {s.label}
                                    {s.enabled ? <Minus size={12} /> : <Plus size={12} />}
                                </button>
                            ))}
                        </div>

                        {/* HEADERS/FOOTERS GUIDE */}
                        <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 mt-4 outline outline-2 outline-blue-200/50">
                            <p className="text-[10px] font-black text-blue-700 mb-2 uppercase tracking-widest flex items-center gap-2">
                                <AlertCircle className="h-4 w-4" />
                                Clean Print Guide
                            </p>
                            <p className="text-[11px] text-blue-600 leading-relaxed font-bold">
                                To hide the browser text at the very top:
                            </p>
                            <ol className="text-[10px] text-blue-600/80 mt-2 space-y-1 list-decimal pl-4 font-bold">
                                <li>Click **Finalize & Print**</li>
                                <li>Open **More Settings**</li>
                                <li>**Uncheck** "Headers and footers"</li>
                            </ol>
                        </div>

                        <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100">
                            <p className="text-[10px] font-bold text-orange-700 mb-1 flex items-center gap-1.5 uppercase">
                                <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" />
                                Live Preview
                            </p>
                            <p className="text-[11px] text-orange-600 leading-relaxed font-semibold">Changes made here only affect the printed document.</p>
                        </div>
                    </div>

                    {/* PREVIEW CONTENT */}
                    <div className="flex-1 overflow-auto bg-white rounded-[24px] shadow-2xl border p-8 border-slate-200 relative scrollbar-hide">
                        <div className="pt-[65mm]">
                        </div>
                        {/* Spacing for physical letterhead */}

                        <div ref={printRef} className="print-area">

                            {/* PATIENT INFO */}
                            {isEnabled("header") && (
                                <div className="patient-box">
                                    <div>
                                        <div className="patient-name">{patient?.name}</div>
                                        <div className="patient-meta">ID: {patient?.id} • {patient?.age} Y • {patient?.gender}</div>
                                    </div>
                                    <div style={{ textAlign: "right" }}>
                                        <div className="patient-meta">Visit Date</div>
                                        <div style={{ fontSize: 12, fontWeight: 800, color: "#1e40af" }}>{patient?.visitDate}</div>
                                    </div>
                                </div>
                            )}

                            {/* VITALS */}
                            {isEnabled("vitals") && vitals && Object.keys(vitals).length > 0 && (
                                <div className="section">
                                    <div className="section-title">Clinical Vitals</div>
                                    <div className="vitals-grid">
                                        {[
                                            { key: 'bloodPressure', label: 'BP', unit: 'mmHg' },
                                            { key: 'pulse', label: 'Pulse', unit: 'bpm' },
                                            { key: 'temperature', label: 'Temp', unit: '°F' },
                                            { key: 'spO2', label: 'SpO₂', unit: '%' }, // Note lowercase keys match DTO usually
                                            { key: 'SpO2', label: 'SpO₂', unit: '%' }, // Handle potential casing diffs
                                            { key: 'weight', label: 'Weight', unit: 'kg' },
                                            { key: 'height', label: 'Height', unit: 'cm' },
                                            { key: 'bmi', label: 'BMI', unit: '' },
                                        ].map(({ key, label, unit }) => {
                                            const val = vitals[key] || vitals[key.charAt(0).toUpperCase() + key.slice(1)]; // Try camel & Pascal
                                            if (!val) return null;
                                            return (
                                                <div key={key} className="vital-box">
                                                    <div className="vital-label">{label}</div>
                                                    <div className="vital-value">{val} <span className="text-[8px] text-slate-400 font-normal">{unit}</span></div>
                                                </div>
                                            );
                                        })}
                                        {/* Fallback for other unmapped vitals */}
                                        {Object.entries(vitals).map(([k, v]) => {
                                            const lowerK = k.toLowerCase();
                                            if (['bloodpressure', 'pulse', 'temperature', 'spo2', 'weight', 'height', 'bmi', 'visitid', 'vitalsid', 'visit'].includes(lowerK)) return null;
                                            if (!v) return null;
                                            return (
                                                <div key={k} className="vital-box">
                                                    <div className="vital-label">{k}</div>
                                                    <div className="vital-value">{v}</div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* CLINICAL FINDINGS */}
                            <div className="grid grid-cols-2 gap-6">
                                {isEnabled("complaints") && complaints.length > 0 && (
                                    <div className="section">
                                        <div className="section-title">Complaints</div>
                                        <div className="flex flex-wrap gap-1.5">
                                            {complaints.map((c, i) => <span key={i} className="chip">{c}</span>)}
                                        </div>
                                    </div>
                                )}
                                {isEnabled("diagnosis") && diagnosis.length > 0 && (
                                    <div className="section">
                                        <div className="section-title">Diagnosis</div>
                                        <div className="flex flex-wrap gap-1.5">
                                            {diagnosis.map((d, i) => <span key={i} className="chip" style={{ background: '#eff6ff', color: '#1d4ed8' }}>{d}</span>)}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* PRESCRIPTION */}
                            {isEnabled("prescription") && medicines.length > 0 && (
                                <div className="section">
                                    <div className="section-title">℞ Medication Order</div>
                                    <table>
                                        <thead>
                                            <tr>
                                                <th style={{ width: "60px" }}>Type</th>
                                                <th>Medicine</th>
                                                <th>Dosage</th>
                                                <th>Timing</th>
                                                <th>Freq</th>
                                                <th>Period</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {medicines.map((m, i) => (
                                                <tr key={i}>
                                                    <td className="text-[8px] font-black text-slate-400 uppercase">{m.type || "Tab"}</td>
                                                    <td className="med-name">{m.medicine || m.name}</td>
                                                    <td className="font-bold">{m.dosage}</td>
                                                    <td className="italic text-slate-500">{m.when}</td>
                                                    <td className="med-freq">{m.frequency}</td>
                                                    <td className="font-bold">{m.duration}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* FAMILY HISTORY */}
                            {isEnabled("family") && familyPedigree.length > 0 && (
                                <div className="section">
                                    <div className="section-title">Family Pedigree</div>
                                    <div className="pedigree-container">
                                        <div style={{ display: "flex", gap: 20 }}>
                                            <div style={{ flex: 1 }}>
                                                <div className="pedigree-row">{matList.map(renderNode)}</div>
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div className="pedigree-row">{patList.map(renderNode)}</div>
                                            </div>
                                        </div>
                                        {others.length > 0 && (
                                            <div style={{ marginTop: 10, paddingTop: 10, borderTop: "0.5px dashed #e2e8f0" }}>
                                                <div className="pedigree-row" style={{ gap: 20 }}>
                                                    {patientNode && renderNode(patientNode)}
                                                    {others.map(renderNode)}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* SOCIAL HISTORY */}
                            {isEnabled("social") && socialHistory && Object.values(socialHistory).some(Boolean) && (
                                <div className="section">
                                    <div className="section-title">Social History</div>
                                    <div className="grid grid-cols-3 gap-3">
                                        {Object.entries(socialHistory).map(([k, v]) =>
                                            v ? (
                                                <div key={k} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                                    <div className="vital-label" style={{ marginBottom: 2 }}>{k}</div>
                                                    <div className="text-[10px] font-bold text-slate-700">{v}</div>
                                                </div>
                                            ) : null
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* PANSS SCALE */}
                            {isEnabled("panss") && panssData && panssData.positive && (panssData.positive.length > 0 || panssData.negative.length > 0 || panssData.general.length > 0) && (
                                <div className="section">
                                    <div className="section-title">Psychiatric Scale (PANSS)</div>
                                    <div className="grid grid-cols-3 gap-4">
                                        {[
                                            { title: "Positive Scale", data: panssData.positive || [] },
                                            { title: "Negative Scale", data: panssData.negative || [] },
                                            { title: "General Psychopathology", data: panssData.general || [] }
                                        ].map((category, idx) => (
                                            category.data.length > 0 && (
                                                <div key={idx} className="border border-slate-200 rounded-md overflow-hidden">
                                                    <div className="bg-slate-50 px-2 py-1 text-[8px] font-bold text-slate-700 uppercase border-b border-slate-200">
                                                        {category.title}
                                                    </div>
                                                    <div className="p-2 space-y-1">
                                                        {category.data.map((item, i) => (
                                                            <div key={i} className="flex justify-between text-[8px]">
                                                                <span className="text-slate-600 truncate pr-2">{item.code} - {item.label}</span>
                                                                <span className="font-bold text-slate-900">{item.score}</span>
                                                            </div>
                                                        ))}
                                                        <div className="border-t border-slate-200 mt-1 pt-1 flex justify-between text-[8px] font-bold">
                                                            <span>Total</span>
                                                            <span>{category.data.reduce((sum, item) => sum + item.score, 0)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        ))}
                                    </div>
                                    <div className="mt-2 text-right">
                                        <span className="text-[9px] font-bold text-slate-700">Total PANSS Score: </span>
                                        <span className="text-[10px] font-bold text-purple-700">
                                            {(panssData.positive.reduce((a, b) => a + b.score, 0) +
                                                panssData.negative.reduce((a, b) => a + b.score, 0) +
                                                panssData.general.reduce((a, b) => a + b.score, 0))}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* ADVICE */}
                            {(isEnabled("advice") && (advice || tests.length > 0)) && (
                                <div className="section">
                                    <div className="section-title">Advice & Investigations</div>
                                    <div className="space-y-4 pt-1">
                                        {advice && <div className="p-4 bg-slate-900 rounded-2xl text-[11px] leading-relaxed font-bold text-slate-100 italic">{advice}</div>}
                                        {tests.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5">
                                                {tests.map((t, i) => <span key={i} className="chip" style={{ background: '#f0fdf4', color: '#16a34a' }}>{t}</span>)}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default PrintPreview;
