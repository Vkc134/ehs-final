import { useState, useRef } from "react";
import { Printer, Plus, Minus } from "lucide-react";
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

        win.document.write(`
      <html>
        <head>
          <title>Prescription - {patient?.name || ""}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Noto+Sans+Telugu:wght@400;700&display=swap');
            
            * { margin: 0; padding: 0; box-sizing: border-box; }
            
            body {
              font-family: 'Inter', sans-serif;
              padding: 0;
              margin: 0;
              font-size: 10px;
              color: #1e293b;
              background: white;
            }

            .page-container {
                width: 210mm;
                min-height: 297mm;
                padding: 8mm 15mm 15mm 15mm;
                margin: 0 auto;
                position: relative;
                display: flex;
                flex-direction: column;
            }

            /* --- LETTERHEAD --- */
            .letterhead {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                border-bottom: 2px solid #1e3a8a;
                padding-bottom: 10px;
                margin-bottom: 12px;
            }
            .lh-left { max-width: 45%; }
            .lh-right { max-width: 40%; text-align: right; }
            .lh-center { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 0 10px; }
            .lh-brain { width: 50px; height: 50px; border-radius: 50%; border: 1.5px solid #1e3a8a; display: flex; align-items: center; justify-content: center; font-size: 22px; }
            .lh-timings { margin-top: 6px; border: 1px solid #1e3a8a; border-radius: 3px; padding: 2px 6px; font-size: 7px; font-weight: 700; color: #1e3a8a; white-space: nowrap; }
            .lh-telugu-title { color: #b91c1c; font-weight: 700; font-size: 10px; font-family: 'Noto Sans Telugu', sans-serif; line-height: 1.4; }
            .lh-eng-title { color: #1e3a8a; font-weight: 900; font-size: 8px; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 3px; }
            .lh-telugu-dr { color: #b91c1c; font-weight: 700; font-size: 9px; font-family: 'Noto Sans Telugu', sans-serif; margin-top: 5px; }
            .lh-telugu-detail { color: #1e3a8a; font-size: 7.5px; margin-top: 2px; line-height: 1.6; }
            .lh-eng-dr { color: #1e3a8a; font-weight: 900; font-size: 11px; }
            .lh-eng-detail { color: #1e3a8a; font-size: 7.5px; line-height: 1.6; margin-top: 3px; }

            /* --- CONTENT LAYOUT --- */
            .section { margin-bottom: 15px; page-break-inside: avoid; }
            
            .section-title {
              font-size: 9px;
              font-weight: 800;
              color: #1e40af;
              text-transform: uppercase;
              letter-spacing: 0.1em;
              border-bottom: 1px solid #e2e8f0;
              padding-bottom: 3px;
              margin-bottom: 8px;
              display: flex;
              align-items: center;
              gap: 5px;
            }

            .patient-box {
                background: #f8fafc;
                padding: 10px 15px;
                border: 1px solid #e2e8f0;
                border-radius: 6px;
                display: flex;
                justify-content: space-between;
                margin-bottom: 15px;
            }

            .patient-name { font-size: 13px; font-weight: 800; color: #1e293b; }
            .patient-meta { font-size: 9px; font-weight: 700; color: #64748b; text-transform: uppercase; }

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
                padding: 15px;
                border-radius: 8px;
                border: 1px solid #f1f5f9;
            }

            .pedigree-row { display: flex; justify-content: center; gap: 20px; margin-top: 10px; }
            .pedigree-node { text-align: center; width: 60px; }
            .node-symbol { font-size: 18px; line-height: 1; }
            .node-m { color: #2563eb; }
            .node-f { color: #db2777; }
            .node-label { font-size: 7px; font-weight: 800; color: #64748b; text-transform: uppercase; }
            .node-info { font-size: 7px; color: #1e40af; font-weight: 600; }

            .footer-signature {
                margin-top: auto;
                padding-top: 40px;
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
            <div class="letterhead">
              <div class="lh-left">
                <p class="lh-telugu-title">మనీష న్యూరో సైకియాట్రిక్ క్లినిక్ &amp; కౌన్సెలింగ్ సెంటర్</p>
                <p class="lh-eng-title">Manisha Neuro Psychiatric Clinic &amp; Counselling Centre</p>
                <p class="lh-telugu-dr">డా॥ బి.ఎస్.జి. వశిష్ఠ</p>
                <p class="lh-telugu-detail">ఎం.బి.బి.ఎస్, డి.పి.యం. (ఉస్మానియా)<br/>కన్సల్టెంట్ న్యూరో సైకియాట్రిస్ట్<br/>రిజిస్ట్రేషన్ నెం. 65349<br/>హెచ్.నెం. 6-2-305, పింజార్ల స్ట్రీట్,<br/>హనుమాన్ టెంపుల్ దగ్గర, చౌరాస్తా నుండి<br/>హనుమాన్ టెంపుల్ రోడ్, హన్మకొండ.</p>
              </div>
              <div class="lh-center">
                <div class="lh-brain">🧠</div>
                <div class="lh-timings">Timings : 11-00 a.m. to 7-00 p.m.</div>
              </div>
              <div class="lh-right">
                <p class="lh-eng-dr">Dr. B.S.G. VASISTA</p>
                <p class="lh-eng-detail">M.B.B.S., DPM (Osm)<br/>Consultant Neuro Psychiatrist<br/>Regd. No. 65349<br/>H.No. 6-2-305, Pinjarla Street,<br/>Near Hanuman Temple,<br/>Chowrasta to Hanuman Temple Road,<br/>Hanamkonda.<br/>Cell : 94907 55000, 73827 55000</p>
              </div>
            </div>

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
                        {/* Letterhead Preview */}
                        <div className="flex items-start justify-between border-b-2 border-blue-900 pb-4 mb-6">
                            <div className="max-w-[45%]">
                                <p className="text-red-700 font-bold text-[11px] leading-snug" style={{ fontFamily: "'Noto Sans Telugu', sans-serif" }}>మనీష న్యూరో సైకియాట్రిక్ క్లినిక్ &amp; కౌన్సెలింగ్ సెంటర్</p>
                                <p className="text-blue-900 font-black text-[8px] uppercase tracking-wide mt-1">Manisha Neuro Psychiatric Clinic &amp; Counselling Centre</p>
                                <p className="text-red-700 font-bold text-[10px] mt-1" style={{ fontFamily: "'Noto Sans Telugu', sans-serif" }}>డా॥ బి.ఎస్.జి. వశిష్ఠ</p>
                                <p className="text-blue-900 text-[8px] mt-0.5 leading-relaxed">ఎం.బి.బి.ఎస్, డి.పి.యం. (ఉస్మానియా)<br />కన్సల్టెంట్ న్యూరో సైకియాట్రిస్ట్<br />రిజిస్ట్రేషన్ నెం. 65349<br />హెచ్.నెం. 6-2-305, పింజార్ల స్ట్రీట్, హనుమాన్ టెంపుల్ దగ్గర,<br />చౌరాస్తా నుండి హనుమాన్ టెంపుల్ రోడ్, హన్మకొండ.</p>
                            </div>
                            <div className="flex flex-col items-center justify-center px-3">
                                <div className="w-12 h-12 rounded-full border-2 border-blue-800 flex items-center justify-center text-2xl">🧠</div>
                                <div className="mt-1 border border-blue-800 rounded px-2 py-0.5 text-[7px] font-bold text-blue-800 text-center whitespace-nowrap">Timings : 11-00 a.m. to 7-00 p.m.</div>
                            </div>
                            <div className="max-w-[38%] text-right">
                                <p className="text-blue-900 font-black text-sm">Dr. B.S.G. VASISTA</p>
                                <p className="text-blue-900 text-[8px] leading-relaxed mt-1">M.B.B.S., DPM (Osm)<br />Consultant Neuro Psychiatrist<br />Regd. No. 65349<br />H.No. 6-2-305, Pinjarla Street,<br />Near Hanuman Temple,<br />Chowrasta to Hanuman Temple Road,<br />Hanamkonda.<br />Cell : 94907 55000, 73827 55000</p>
                            </div>
                        </div>

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
