import React from "react";
import { History, Copy } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

export default function PastVisitsModal({ open, onOpenChange, visits, onCopyMedicine, onCopyAllMedicines, onCopyVisit, customActionLabel }) {
    const completedVisits = visits.filter(v => v.status === "Completed");

    // Pagination State
    const [currentPage, setCurrentPage] = React.useState(1);
    const itemsPerPage = 5;
    const totalPages = Math.ceil(completedVisits.length / itemsPerPage);

    const paginatedVisits = completedVisits.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <History className="w-5 h-5" /> Patient Visit History
                    </DialogTitle>
                </DialogHeader>

                <ScrollArea className="flex-1 mt-4 pr-4">
                    {completedVisits.length === 0 ? (
                        <div className="py-12 text-center text-slate-400 italic bg-slate-50 rounded-lg">
                            No past history records found.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {paginatedVisits.map(visit => (
                                <div key={visit.visitId} className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-3 border-b pb-3">
                                        <div>
                                            <p className="font-bold text-slate-900 text-lg">
                                                {visit.patientName && <span className="mr-2 text-blue-600">{visit.patientName}</span>}
                                                <span className="text-slate-500 text-sm font-normal">
                                                    {new Date(visit.createdAt).toLocaleDateString()}
                                                </span>
                                                <span className="text-slate-400 font-normal ml-2 text-sm">Visit #{visit.visitId}</span>
                                            </p>
                                            <p className="text-sm text-slate-500 mt-1">
                                                <span className="font-semibold text-slate-700">Diagnosis:</span> {Array.isArray(visit.diagnosis) ? visit.diagnosis.join(", ") : visit.diagnosis}
                                            </p>
                                        </div>
                                        <Button variant="secondary" size="sm" onClick={() => onCopyVisit(visit)}>
                                            <Copy className="w-3 h-3 mr-2" /> {customActionLabel || "Copy Full Visit"}
                                        </Button>
                                    </div>

                                    {/* Vitals Grid */}
                                    {(visit.vitals && Object.keys(visit.vitals).length > 0) && (
                                        <div className="grid grid-cols-4 gap-2 mb-3 bg-slate-50 p-2 rounded-md text-xs">
                                            {visit.vitals.bp && <div><span className="text-slate-500">BP:</span> <span className="font-semibold">{visit.vitals.bp}</span></div>}
                                            {visit.vitals.pulse && <div><span className="text-slate-500">Pulse:</span> <span className="font-semibold">{visit.vitals.pulse}</span></div>}
                                            {visit.vitals.temperature && <div><span className="text-slate-500">Temp:</span> <span className="font-semibold">{visit.vitals.temperature}</span></div>}
                                            {visit.vitals.spo2 && <div><span className="text-slate-500">SpO2:</span> <span className="font-semibold">{visit.vitals.spo2}</span></div>}
                                            {visit.vitals.weight && <div><span className="text-slate-500">Wt:</span> <span className="font-semibold">{visit.vitals.weight}</span></div>}
                                        </div>
                                    )}

                                    {/* Complaints */}
                                    {visit.complaints && visit.complaints.length > 0 && (
                                        <div className="mb-2">
                                            <p className="text-xs font-semibold text-slate-500">Complaints:</p>
                                            <p className="text-sm text-slate-700">
                                                {Array.isArray(visit.complaints) ? visit.complaints.join(", ") : visit.complaints}
                                            </p>
                                        </div>
                                    )}

                                    {/* Medicines */}
                                    <div className="space-y-2 mt-3">
                                        <div className="flex justify-between items-center">
                                            <p className="text-xs font-semibold uppercase text-slate-500">Medications</p>
                                            <Button variant="ghost" size="sm" className="h-5 text-[10px]" onClick={() => onCopyAllMedicines && onCopyAllMedicines(visit.medicines)}>
                                                Copy All
                                            </Button>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {visit.medicines?.map((m, i) => (
                                                <Badge
                                                    key={i}
                                                    variant="outline"
                                                    className="bg-slate-50 hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition-colors py-1 px-2"
                                                    onClick={() => onCopyMedicine && onCopyMedicine(m)}
                                                >
                                                    {m.name}
                                                    {onCopyMedicine && <span className="ml-1 text-xs opacity-50">+ Add</span>}
                                                </Badge>
                                            ))}
                                            {(!visit.medicines || visit.medicines.length === 0) && <span className="text-xs text-slate-400 italic">No medicines.</span>}
                                        </div>
                                    </div>

                                    {/* Laboratory Tests */}
                                    {visit.tests && visit.tests.length > 0 && (
                                        <div className="mt-3">
                                            <p className="text-xs font-semibold text-slate-500">Lab Tests:</p>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {(Array.isArray(visit.tests) ? visit.tests : [visit.tests]).map((t, i) => (
                                                    <span key={i} className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded border border-purple-100">
                                                        {t}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Advice if needed */}
                                    {visit.advice && (
                                        <div className="mt-3 text-xs bg-yellow-50 p-2 rounded text-yellow-800 border-yellow-100">
                                            <b>Advice:</b> {visit.advice}
                                        </div>
                                    )}

                                    {/* Next Visit */}
                                    {visit.nextVisit && (
                                        <div className="mt-2 text-xs text-slate-500">
                                            Next Visit: <span className="font-semibold text-slate-700">{new Date(visit.nextVisit).toLocaleDateString()}</span>
                                        </div>
                                    )}

                                    {/* Attachment */}
                                    {visit.attachmentPath && (
                                        <div className="mt-2">
                                            <a
                                                href={`${import.meta.env.VITE_API_URL || "http://localhost:5266"}${visit.attachmentPath.startsWith("/") ? "" : "/"}${visit.attachmentPath}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-xs flex items-center gap-1 text-blue-600 hover:underline"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" /></svg>
                                                View Attachment
                                            </a>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="flex justify-between items-center mt-4 border-t pt-4">
                        <Button
                            variant="input"
                            size="sm"
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </Button>
                        <span className="text-xs text-slate-500">Page {currentPage} of {totalPages}</span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                        >
                            Next
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
