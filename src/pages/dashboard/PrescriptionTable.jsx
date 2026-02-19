import React, { useState, useEffect } from "react";
import { Plus, Trash2, GripVertical, Pill, Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import axiosInstance from "@/api/axios";
import { cn } from "@/lib/utils";

const medicineTypes = ["Tab", "Cap", "Syp", "Inj", "Oint", "Drops", "Sachet", "Powder", "Cream", "Gel"];
const whenOptions = ["After Food", "Before Food", "With Food", "Empty Stomach"];
const frequencyOptions = ["1-0-1", "1-0-0", "0-0-1", "0-1-0", "1-1-1", "2-0-2", "2-0-0", "0-0-2", "1/2-0-1/2", "1/2-0-0", "0-1/2-0", "0-0-1/2", "SOS", "Twice a week", "Once a week"];
const durationOptions = ["1 Day", "3 Days", "5 Days", "7 Days", "10 Days", "14 Days", "1 Month", "3 Months", "Continue"];

export default function PrescriptionTable({ initialMedicines, onMedicinesChange }) {
    const [openComboboxId, setOpenComboboxId] = useState(null);
    const [drugSuggestions, setDrugSuggestions] = useState([]);

    // Search drugs
    const searchDrugs = async (query) => {
        if (!query) return;
        try {
            const res = await axiosInstance.get(`/drugs?query=${query}`);
            setDrugSuggestions(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const addRow = () => {
        onMedicinesChange([
            ...initialMedicines,
            {
                id: Date.now(),
                type: "Tab",
                name: "",
                dosage: "",
                when: "After Food",
                frequency: "1-0-1",
                duration: "3 Days",
                notes: ""
            }
        ]);
    };

    const updateMedicine = (id, field, value) => {
        onMedicinesChange(
            initialMedicines.map(m => (m.id === id ? { ...m, [field]: value } : m))
        );
    };

    const handleMedicineSelect = async (id, drug) => {
        updateMedicine(id, "name", drug.name);
        if (drug.defaultDosage) updateMedicine(id, "dosage", drug.defaultDosage);
        if (drug.defaultFrequency) updateMedicine(id, "frequency", drug.defaultFrequency);
        if (drug.defaultDuration) updateMedicine(id, "duration", drug.defaultDuration);
        setOpenComboboxId(null);
    };

    const handleMedicineCreate = async (id, name) => {
        updateMedicine(id, "name", name);
        setOpenComboboxId(null);
        // Save to DB for future
        try {
            await axiosInstance.post("/drugs", { name });
        } catch (err) {
            console.error("Failed to save new drug", err);
        }
    };

    const removeRow = (id) => {
        onMedicinesChange(initialMedicines.filter(m => m.id !== id));
    };

    return (
        <Card className="border-slate-200 shadow-sm overflow-visible">
            {/* Header */}
            <div className="px-4 py-3 flex items-center justify-between border-b bg-slate-50/50">
                <div className="flex items-center gap-2">
                    <Pill className="w-5 h-5 text-purple-600" />
                    <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Prescriptions</h2>
                </div>
                <Button onClick={addRow} size="sm" variant="outline" className="gap-1.5 h-8 text-xs font-bold border-slate-300 hover:bg-slate-100 transition-all">
                    <Plus className="h-3.5 w-3.5" />
                    Add Medicine
                </Button>
            </div>

            <CardContent className="p-0 overflow-visible">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-2 px-4 py-2 bg-slate-100/50 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b">
                    <div className="col-span-1">#</div>
                    <div className="col-span-1">Type</div>
                    <div className="col-span-3">Medicine</div>
                    <div className="col-span-1">Dosage</div>
                    <div className="col-span-2">When</div>
                    <div className="col-span-1">Frequency</div>
                    <div className="col-span-1">Duration</div>
                    <div className="col-span-1">Notes</div>
                    <div className="col-span-1"></div>
                </div>

                {/* Table Body */}
                <div className="divide-y divide-slate-100">
                    {initialMedicines.map((medicine, index) => (
                        <div key={medicine.id} className="grid grid-cols-12 gap-2 px-4 py-2 items-center group hover:bg-slate-50/30 transition-colors relative">
                            {/* Index */}
                            <div className="col-span-1 flex items-center gap-1 text-slate-400">
                                <GripVertical className="h-3.5 w-3.5 opacity-0 group-hover:opacity-50 cursor-grab" />
                                <span className="text-xs font-bold">{index + 1}</span>
                            </div>

                            {/* Type */}
                            <div className="col-span-1">
                                <Select value={medicine.type} onValueChange={(v) => updateMedicine(medicine.id, "type", v)}>
                                    <SelectTrigger className="h-8 text-[11px] px-2 bg-white border-slate-200 shadow-none focus:ring-0">
                                        <SelectValue placeholder="Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {medicineTypes.map((t) => (
                                            <SelectItem key={t} value={t} className="text-[11px]">{t}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Medicine (Combobox) */}
                            <div className="col-span-3">
                                <Popover open={openComboboxId === medicine.id} onOpenChange={(open) => setOpenComboboxId(open ? medicine.id : null)}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            className="w-full justify-between h-8 text-[11px] bg-white border-slate-200 shadow-none px-2 font-normal"
                                        >
                                            {medicine.name || "Select medicine..."}
                                            <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[300px] p-0">
                                        <Command shouldFilter={false}>
                                            <CommandInput
                                                placeholder="Search medicine..."
                                                className="h-9"
                                                onValueChange={(val) => searchDrugs(val)}
                                            />
                                            <CommandEmpty className="py-2 px-4 text-xs text-slate-500">
                                                <p>No drug found.</p>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="w-full justify-start text-blue-600 h-6 mt-1"
                                                    onClick={() => handleMedicineCreate(medicine.id, document.querySelector('[cmdk-input]')?.value || "New Medicine")}
                                                >
                                                    <Plus className="w-3 h-3 mr-1" /> Add as new
                                                </Button>
                                            </CommandEmpty>
                                            <CommandGroup>
                                                {drugSuggestions.map((drug) => (
                                                    <CommandItem
                                                        key={drug.id}
                                                        value={drug.name}
                                                        onSelect={() => handleMedicineSelect(medicine.id, drug)}
                                                        className="text-xs"
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-3 w-3",
                                                                medicine.name === drug.name ? "opacity-100" : "opacity-0"
                                                            )}
                                                        />
                                                        {drug.name}
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </div>

                            {/* Dosage (Manual Input) */}
                            <div className="col-span-1">
                                <Input
                                    value={medicine.dosage || ""}
                                    onChange={(e) => updateMedicine(medicine.id, "dosage", e.target.value)}
                                    placeholder="Dose"
                                    className="h-8 text-[11px] bg-white border-slate-200 shadow-none focus-visible:ring-1 focus-visible:ring-slate-300"
                                />
                            </div>

                            {/* When */}
                            <div className="col-span-2">
                                <Select value={medicine.when} onValueChange={(v) => updateMedicine(medicine.id, "when", v)}>
                                    <SelectTrigger className="h-8 text-[11px] px-2 bg-white border-slate-200 shadow-none focus:ring-0">
                                        <SelectValue placeholder="When" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {whenOptions.map((o) => (
                                            <SelectItem key={o} value={o} className="text-[11px]">{o}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Frequency */}
                            <div className="col-span-1">
                                <Select value={medicine.frequency} onValueChange={(v) => updateMedicine(medicine.id, "frequency", v)}>
                                    <SelectTrigger className="h-8 text-[11px] px-2 bg-white border-slate-200 shadow-none focus:ring-0">
                                        <SelectValue placeholder="Freq" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {frequencyOptions.map((f) => (
                                            <SelectItem key={f} value={f} className="text-[11px]">{f}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Duration */}
                            <div className="col-span-1">
                                <Select value={medicine.duration} onValueChange={(v) => updateMedicine(medicine.id, "duration", v)}>
                                    <SelectTrigger className="h-8 text-[11px] px-2 bg-white border-slate-200 shadow-none focus:ring-0">
                                        <SelectValue placeholder="Days" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {durationOptions.map((d) => (
                                            <SelectItem key={d} value={d} className="text-[11px]">{d}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Notes */}
                            <div className="col-span-1">
                                <Input
                                    value={medicine.notes || ""}
                                    onChange={(e) => updateMedicine(medicine.id, "notes", e.target.value)}
                                    placeholder="Notes"
                                    className="h-8 text-[11px] bg-white border-slate-200 shadow-none focus-visible:ring-1 focus-visible:ring-slate-300"
                                />
                            </div>

                            {/* Delete */}
                            <div className="col-span-1 flex justify-end">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-slate-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                                    onClick={() => removeRow(medicine.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                    {initialMedicines.length === 0 && (
                        <div className="py-10 text-center text-slate-400 text-xs italic">
                            No medicines added. Click "Add Medicine" to begin.
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
