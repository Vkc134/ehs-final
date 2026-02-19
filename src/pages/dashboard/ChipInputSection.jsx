import React, { useState } from "react";
import { X, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";

export default function ChipInputSection({ title, placeholder, initialItems = [], onItemsChange, color = "blue" }) {
    const [inputValue, setInputValue] = useState("");

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && inputValue.trim()) {
            e.preventDefault();
            if (!initialItems.includes(inputValue.trim())) {
                onItemsChange([...initialItems, inputValue.trim()]);
            }
            setInputValue("");
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
                    {initialItems.length === 0 && <span className="text-slate-400 italic text-sm py-1">No items added</span>}
                </div>
                <div className="relative mt-auto">
                    <Plus className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder}
                        className="pl-9 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                    />
                </div>
            </CardContent>
        </Card>
    );
}
