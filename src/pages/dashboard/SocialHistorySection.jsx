import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

export default function SocialHistorySection({ initialData, onDataChange }) {
    const handleChange = (key, checked) => {
        onDataChange({ ...initialData, [key]: checked });
    };

    const handleNotesChange = (e) => {
        onDataChange({ ...initialData, notes: e.target.value });
    }

    return (
        <Card className="border-slate-200">
            <CardHeader className="py-3 px-5 bg-slate-50/50 border-b">
                <CardTitle className="text-sm font-semibold uppercase text-slate-500">Social History</CardTitle>
            </CardHeader>
            <CardContent className="p-5 grid gap-4">
                <div className="flex flex-wrap gap-6">
                    <div className="flex items-center space-x-2">
                        <Checkbox id="smoking" checked={!!initialData.smoking} onCheckedChange={(c) => handleChange("smoking", c)} />
                        <Label htmlFor="smoking">Smoker</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox id="alcohol" checked={!!initialData.alcohol} onCheckedChange={(c) => handleChange("alcohol", c)} />
                        <Label htmlFor="alcohol">Alcohol Consumption</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox id="exercise" checked={!!initialData.exercise} onCheckedChange={(c) => handleChange("exercise", c)} />
                        <Label htmlFor="exercise">Regular Exercise</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox id="diet" checked={!!initialData.diet} onCheckedChange={(c) => handleChange("diet", c)} />
                        <Label htmlFor="diet">Strict Diet</Label>
                    </div>
                </div>
                <div>
                    <Label className="text-xs mb-1.5 block text-slate-400">Notes (Occupation, Stress, Sleep)</Label>
                    <Textarea
                        placeholder="Additional details..."
                        className="h-20 resize-none bg-slate-50"
                        value={initialData.notes || ""}
                        onChange={handleNotesChange}
                    />
                </div>
            </CardContent>
        </Card>
    );
}
