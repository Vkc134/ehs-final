import React, { useState } from "react";
import { Activity, Heart, Thermometer, Wind, Pencil, Check, Scale } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function VitalsSection({ initialVitals, onVitalsChange }) {
    const [isEditing, setIsEditing] = useState(false);

    const handleChange = (key, value) => {
        onVitalsChange({ ...initialVitals, [key]: value });
    };

    const toggleEdit = () => {
        setIsEditing(!isEditing);
    };

    return (
        <Card className="border-slate-200">
            <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4 border-b pb-2">
                    <div className="flex items-center gap-2 text-slate-800 font-semibold">
                        <Activity className="w-5 h-5 text-red-500" /> Vitals
                    </div>
                    <Button variant="ghost" size="sm" onClick={toggleEdit} className="h-8 w-8 p-0">
                        {isEditing ? <Check className="w-4 h-4 text-green-600" /> : <Pencil className="w-4 h-4 text-slate-400" />}
                    </Button>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
                    {/* BP */}
                    <div className="space-y-2">
                        <Label className="uppercase text-xs font-bold text-slate-400">BP (mmHg)</Label>
                        <div className="relative">
                            <Heart className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            {isEditing ? (
                                <Input
                                    className="pl-9 font-mono font-medium"
                                    placeholder="120/80"
                                    value={initialVitals.bp || ""}
                                    onChange={(e) => handleChange("bp", e.target.value)}
                                />
                            ) : (
                                <div className="pl-9 py-2 font-mono font-bold text-lg text-slate-700">
                                    {initialVitals.bp || "--"}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Pulse */}
                    <div className="space-y-2">
                        <Label className="uppercase text-xs font-bold text-slate-400">Pulse (bpm)</Label>
                        <div className="relative">
                            <Activity className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            {isEditing ? (
                                <Input
                                    className="pl-9 font-mono font-medium"
                                    placeholder="72"
                                    value={initialVitals.pulse || ""}
                                    onChange={(e) => handleChange("pulse", e.target.value)}
                                    type="number"
                                />
                            ) : (
                                <div className="pl-9 py-2 font-mono font-bold text-lg text-slate-700">
                                    {initialVitals.pulse || "--"}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Temp */}
                    <div className="space-y-2">
                        <Label className="uppercase text-xs font-bold text-slate-400">Temp (°F)</Label>
                        <div className="relative">
                            <Thermometer className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            {isEditing ? (
                                <Input
                                    className="pl-9 font-mono font-medium"
                                    placeholder="98.6"
                                    value={initialVitals.temperature || ""}
                                    onChange={(e) => handleChange("temperature", e.target.value)}
                                />
                            ) : (
                                <div className="pl-9 py-2 font-mono font-bold text-lg text-slate-700">
                                    {initialVitals.temperature || "--"}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* SpO2 */}
                    <div className="space-y-2">
                        <Label className="uppercase text-xs font-bold text-slate-400">SpO2 (%)</Label>
                        <div className="relative">
                            <Wind className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            {isEditing ? (
                                <Input
                                    className="pl-9 font-mono font-medium"
                                    placeholder="99"
                                    value={initialVitals.spo2 || ""}
                                    onChange={(e) => handleChange("spo2", e.target.value)}
                                    type="number"
                                />
                            ) : (
                                <div className="pl-9 py-2 font-mono font-bold text-lg text-slate-700">
                                    {initialVitals.spo2 || "--"}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Weight */}
                    <div className="space-y-2">
                        <Label className="uppercase text-xs font-bold text-slate-400">Weight (kg)</Label>
                        <div className="relative">
                            <Scale className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            {isEditing ? (
                                <Input
                                    className="pl-9 font-mono font-medium"
                                    placeholder="70"
                                    value={initialVitals.weight || ""}
                                    onChange={(e) => handleChange("weight", e.target.value)}
                                    type="number"
                                />
                            ) : (
                                <div className="pl-9 py-2 font-mono font-bold text-lg text-slate-700">
                                    {initialVitals.weight || "--"}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-5 gap-6 mt-6 pt-6 border-t border-slate-100">
                    {/* Height */}
                    <div className="space-y-2">
                        <Label className="uppercase text-xs font-bold text-slate-400">Height (cm)</Label>
                        <div className="relative">
                            <Activity className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            {isEditing ? (
                                <Input
                                    className="pl-9 font-mono font-medium"
                                    placeholder="170"
                                    value={initialVitals.height || ""}
                                    onChange={(e) => handleChange("height", e.target.value)}
                                    type="number"
                                />
                            ) : (
                                <div className="pl-9 py-2 font-mono font-bold text-lg text-slate-700">
                                    {initialVitals.height || "--"}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* BMI */}
                    <div className="space-y-2">
                        <Label className="uppercase text-xs font-bold text-slate-400">BMI</Label>
                        <div className="relative">
                            <Activity className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            {isEditing ? (
                                <Input
                                    className="pl-9 font-mono font-medium"
                                    placeholder="24.2"
                                    value={initialVitals.bmi || ""}
                                    readOnly // BMI usually calculated, but let's keep it editable or maybe readonly? keeping readonly for now if calculation logic exists elsewhere. 
                                    // Actually, if we want auto-calc here too, we need logic. For now, let's allow manual edit or display from DB.
                                    onChange={(e) => handleChange("bmi", e.target.value)}
                                />
                            ) : (
                                <div className="pl-9 py-2 font-mono font-bold text-lg text-slate-700">
                                    {initialVitals.bmi || "--"}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
