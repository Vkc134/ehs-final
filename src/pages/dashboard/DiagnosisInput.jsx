import React, { useState, useEffect } from "react";
import { X, Plus, Check, ChevronsUpDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import axiosInstance from "@/api/axios";
import { toast } from "sonner";

export default function DiagnosisInput({ title = "Diagnosis", initialItems = [], onItemsChange, color = "blue" }) {
    const [open, setOpen] = useState(false);
    const [options, setOptions] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (search.length >= 1) {
                fetchICDCodes(search);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [search]);

    const fetchICDCodes = async (query) => {
        try {
            setLoading(true);
            const res = await axiosInstance.get(`/icd11?search=${query}`);
            setOptions(res.data || []);
        } catch (error) {
            console.error("Failed to search diagnoses", error);
            setOptions([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (codeString) => {
        if (!initialItems.includes(codeString)) {
            onItemsChange([...initialItems, codeString]);
        }
        setOpen(false);
        setSearch("");
    };

    const handleCreateNew = async () => {
        if (!search) return;

        try {
            setLoading(true);
            const res = await axiosInstance.post("/icd11", {
                description: search,
                code: "" // Backend will generate a code like CUS-1234
            });

            const newCode = res.data.code;
            const newLabel = `${newCode} - ${search}`;

            handleSelect(newLabel);
            toast.success(`added new diagnosis: ${search}`);
        } catch (error) {
            console.error("Failed to create diagnosis", error);
            toast.error("Failed to add new diagnosis");
        } finally {
            setLoading(false);
        }
    };

    const removeItem = (index) => {
        onItemsChange(initialItems.filter((_, i) => i !== index));
    };

    const badgeVariants = {
        blue: "bg-blue-100 text-blue-700 hover:bg-blue-200",
        red: "bg-red-100 text-red-700 hover:bg-red-200",
        green: "bg-green-100 text-green-700 hover:bg-green-200",
    };

    return (
        <Card className="flex flex-col h-full border-slate-200 shadow-sm">
            <CardHeader className="py-3 px-5 border-b bg-slate-50/50">
                <CardTitle className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4 flex-1 flex flex-col gap-3">
                <div className="flex flex-wrap gap-2 min-h-[40px]">
                    {initialItems.map((item, index) => (
                        <Badge
                            key={index}
                            variant="secondary"
                            className={`px-3 py-1 flex items-center gap-1 text-sm font-normal ${badgeVariants[color] || badgeVariants.blue}`}
                        >
                            {item}
                            <button onClick={() => removeItem(index)} className="hover:bg-slate-900/10 rounded-full p-0.5 transition-colors">
                                <X className="w-3 h-3" />
                            </button>
                        </Badge>
                    ))}
                    {initialItems.length === 0 && <span className="text-slate-400 italic text-sm py-1">No diagnosis added</span>}
                </div>

                <div className="mt-auto">
                    <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={open}
                                className="w-full justify-between text-slate-500 font-normal hover:bg-slate-50"
                            >
                                <span className="flex items-center gap-2">
                                    <Plus className="h-4 w-4" />
                                    Add Diagnosis...
                                </span>
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[400px] p-0" align="start">
                            <Command shouldFilter={false}>
                                <CommandInput
                                    placeholder="Search or type new..."
                                    value={search}
                                    onValueChange={setSearch}
                                />
                                <CommandList>
                                    {loading && <div className="py-6 text-center text-sm text-slate-500">Searching...</div>}

                                    {!loading && options.length === 0 && search.length >= 2 && (
                                        <CommandEmpty>No existing diagnosis found.</CommandEmpty>
                                    )}

                                    <CommandGroup heading="Existing Diagnoses">
                                        {options.map((option) => {
                                            const formattedLabel = `${option.code} - ${option.description}`;
                                            return (
                                                <CommandItem
                                                    key={option.id}
                                                    value={formattedLabel}
                                                    onSelect={(currentValue) => handleSelect(currentValue)}
                                                >
                                                    <Check
                                                        className={cn(
                                                            "mr-2 h-4 w-4",
                                                            initialItems.includes(formattedLabel) ? "opacity-100" : "opacity-0"
                                                        )}
                                                    />
                                                    <div className="flex flex-col">
                                                        <span className="font-semibold text-xs">{option.code}</span>
                                                        <span>{option.description}</span>
                                                    </div>
                                                </CommandItem>
                                            );
                                        })}
                                    </CommandGroup>

                                    {!loading && search.length > 0 && (
                                        <>
                                            <CommandSeparator />
                                            <CommandGroup heading="Create New">
                                                <CommandItem
                                                    value={search}
                                                    onSelect={handleCreateNew}
                                                    className="text-blue-600 font-semibold"
                                                >
                                                    <Plus className="mr-2 h-4 w-4" />
                                                    Add "{search}" to database
                                                </CommandItem>
                                            </CommandGroup>
                                        </>
                                    )}
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                </div>
            </CardContent>
        </Card>
    );
}
