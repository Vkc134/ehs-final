import React, { useState } from "react";
import { FileText, Beaker, Calendar } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import ChipInputSection from "./ChipInputSection";
import { Label } from "@/components/ui/label";

export default function AdviceTestsSection({ initialAdvice, initialTests, onAdviceChange, onTestsChange, onNextVisitChange }) {

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-slate-200 shadow-sm flex flex-col h-full">
                <CardHeader className="py-3 px-5 bg-slate-50/50 border-b">
                    <CardTitle className="text-sm font-semibold uppercase text-slate-500 flex items-center gap-2">
                        <FileText className="w-4 h-4" /> Clinical Advice / Notes
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0 flex-1">
                    <Textarea
                        placeholder="Enter clinical notes, lifestyle advice, or detailed instructions..."
                        className="w-full h-full min-h-[150px] border-0 focus-visible:ring-0 resize-none p-4 text-base"
                        value={initialAdvice}
                        onChange={e => onAdviceChange(e.target.value)}
                    />
                </CardContent>
            </Card>

            <div className="space-y-4">
                <ChipInputSection
                    title="Lab Investigations / Tests"
                    placeholder="Add test (e.g. CBC, X-Ray)..."
                    initialItems={initialTests}
                    onItemsChange={onTestsChange}
                    color="green"
                />

                <Card className="border-slate-200 shadow-sm">
                    <CardContent className="p-4 flex items-center gap-4">
                        <Calendar className="w-5 h-5 text-slate-400" />
                        <div className="flex-1">
                            <Label className="text-xs text-slate-500 uppercase font-bold">Next Visit</Label>
                            <Input type="date" className="mt-1" onChange={e => onNextVisitChange(e.target.value)} />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
