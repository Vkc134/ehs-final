import React from "react";
import { History, Copy } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

export default function PastVisitsSection({ visits, onCopyMedicine, onCopyAllMedicines, onCopyVisit }) {
    // Ideally this filters "completed" visits for this patient.
    // For now, illustrating the UI.
    const completedVisits = visits.filter(v => v.status === "Completed");

    return (
        <Card className="border-slate-200 shadow-sm">
            <CardHeader className="py-3 px-5 bg-slate-50/50 border-b flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-semibold uppercase text-slate-500 flex items-center gap-2">
                    <History className="w-4 h-4" /> Past Visits History
                </CardTitle>
                <Badge variant="outline" className="bg-white">{completedVisits.length} Records</Badge>
            </CardHeader>
            <CardContent className="p-0">
                {completedVisits.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-sm italic">
                        No past history available for quick copy.
                    </div>
                ) : (
                    <ScrollArea className="h-[200px]">
                        <div className="divide-y">
                            {completedVisits.map(visit => (
                                <div key={visit.visitId} className="p-4 hover:bg-slate-50 transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <p className="font-bold text-sm text-slate-800">
                                                {new Date(visit.createdAt).toLocaleDateString()}
                                                <span className="text-slate-400 font-normal ml-2 text-xs">#{visit.visitId}</span>
                                            </p>
                                            <p className="text-xs text-slate-500 mt-0.5">
                                                Dx: {visit.diagnosis?.length ? visit.diagnosis.join(", ") : "No Diagnosis"}
                                            </p>
                                        </div>
                                        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => onCopyVisit(visit)}>
                                            <Copy className="w-3 h-3 mr-1" /> Copy Full
                                        </Button>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {visit.medicines?.map((m, i) => (
                                            <Badge key={i} variant="secondary" className="bg-white border text-xs font-normal text-slate-600 gap-1 hover:border-blue-300 cursor-pointer" onClick={() => onCopyMedicine(m)}>
                                                {m.name} <PlusIcon />
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                )}
            </CardContent>
        </Card>
    );
}

function PlusIcon() {
    return <svg className="w-3 h-3 text-slate-300 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
}
