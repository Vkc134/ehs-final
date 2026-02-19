import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const PANSS_ITEMS = {
    P: [
        { id: "P1", label: "Delusions" },
        { id: "P2", label: "Conceptual disorganization" },
        { id: "P3", label: "Hallucinatory behaviour" },
        { id: "P4", label: "Excitement" },
        { id: "P5", label: "Grandiosity" },
        { id: "P6", label: "Suspiciousness/persecution" },
        { id: "P7", label: "Hostility" },
    ],
    N: [
        { id: "N1", label: "Blunted affect" },
        { id: "N2", label: "Emotional withdrawal" },
        { id: "N3", label: "Poor rapport" },
        { id: "N4", label: "Passive/apathetic social withdrawal" },
        { id: "N5", label: "Difficulty in abstract thinking" },
        { id: "N6", label: "Lack of spontaneity & flow of conversation" },
        { id: "N7", label: "Stereotyped thinking" },
    ],
    G: [
        { id: "G1", label: "Somatic concern" },
        { id: "G2", label: "Anxiety" },
        { id: "G3", label: "Guilt feelings" },
        { id: "G4", label: "Tension" },
        { id: "G5", label: "Mannerisms & posturing" },
        { id: "G6", label: "Depression" },
        { id: "G7", label: "Motor retardation" },
        { id: "G8", label: "Uncooperativeness" },
        { id: "G9", label: "Unusual thought content" },
        { id: "G10", label: "Disorientation" },
        { id: "G11", label: "Poor attention" },
        { id: "G12", label: "Lack of judgement & insight" },
        { id: "G13", label: "Disturbance of volition" },
        { id: "G14", label: "Poor impulse control" },
        { id: "G15", label: "Preoccupation" },
        { id: "G16", label: "Active social avoidance" },
    ],
};

const RATING_SCALE = [
    { value: 1, label: "Absent" },
    { value: 2, label: "Minimal" },
    { value: 3, label: "Mild" },
    { value: 4, label: "Moderate" },
    { value: 5, label: "Mod. Severe" },
    { value: 6, label: "Severe" },
    { value: 7, label: "Extreme" },
];

export default function PANSSForm({ data = {}, onChange }) {
    const [isOpen, setIsOpen] = useState(false);

    const handleRatingChange = (itemId, value) => {
        if (value === null) {
            const newData = { ...data };
            delete newData[itemId];
            onChange(newData);
        } else {
            onChange({ ...data, [itemId]: parseInt(value) });
        }
    };

    const renderScale = (items) => (
        <div className="space-y-2">
            {/* Header */}
            <div className="grid grid-cols-[1fr_repeat(7,minmax(40px,1fr))] md:grid-cols-[300px_repeat(7,1fr)] gap-4 text-xs font-semibold text-center pb-3 border-b text-slate-500 items-end">
                <div className="text-left pl-4 uppercase tracking-wider">Item / Rating</div>
                {RATING_SCALE.map((s) => (
                    <div key={s.value} className="flex flex-col items-center gap-1">
                        <span className="text-[10px] font-normal opacity-70 hidden md:block">{s.label}</span>
                        <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                            {s.value}
                        </div>
                    </div>
                ))}
            </div>

            {/* Rows */}
            <div className="grid gap-1">
                {items.map((item, idx) => (
                    <div
                        key={item.id}
                        className={
                            `grid grid-cols-[1fr_repeat(7,minmax(40px,1fr))] md:grid-cols-[300px_repeat(7,1fr)] gap-4 items-center p-3 rounded-lg transition-all
                            ${idx % 2 === 0 ? "bg-white" : "bg-slate-50"}
                            hover:bg-blue-50/50 hover:shadow-sm border border-transparent hover:border-blue-100`
                        }
                    >
                        <Label className="font-medium text-sm text-slate-700 leading-snug cursor-pointer" htmlFor={`${item.id}-1`}>
                            <span className="inline-flex items-center justify-center w-8 h-6 rounded bg-slate-100 text-slate-500 text-xs font-bold mr-3 border border-slate-200">
                                {item.id}
                            </span>
                            {item.label}
                        </Label>

                        <RadioGroup
                            value={data[item.id]?.toString() || ""}
                            onValueChange={(val) => handleRatingChange(item.id, val)}
                            className="contents" // Use 'contents' to let children sit directly in the parent grid
                        >
                            {RATING_SCALE.map((scale) => (
                                <div key={scale.value} className="flex justify-center items-center">
                                    <RadioGroupItem
                                        value={scale.value.toString()}
                                        id={`${item.id}-${scale.value}`}
                                        className="h-5 w-5 border-2 border-slate-300 text-blue-600 data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-50 transition-all cursor-pointer shadow-sm hover:border-blue-400"
                                        onClick={(e) => {
                                            if (data[item.id] === scale.value) {
                                                e.preventDefault();
                                                handleRatingChange(item.id, null);
                                            }
                                        }}
                                    />
                                </div>
                            ))}
                        </RadioGroup>
                    </div>
                ))}
            </div>
        </div>
    );

    const totalScore = Object.values(data).reduce((a, b) => a + (b || 0), 0);
    const filledCount = Object.keys(data).length;

    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
            <Card className="border-slate-200 shadow-sm">
                <CardHeader className="py-3 px-5 border-b bg-slate-50/50 flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-semibold uppercase tracking-wide text-slate-500 flex items-center gap-2">
                        PANSS Rating
                        {totalScore > 0 && (
                            <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full normal-case">
                                Score: {totalScore} ({filledCount}/30)
                            </span>
                        )}
                    </CardTitle>
                    <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            {isOpen ? (
                                <ChevronUp className="h-4 w-4" />
                            ) : (
                                <ChevronDown className="h-4 w-4" />
                            )}
                            <span className="sr-only">Toggle PANSS</span>
                        </Button>
                    </CollapsibleTrigger>
                </CardHeader>
                <CollapsibleContent>
                    <CardContent className="p-4">
                        <Tabs defaultValue="positive" className="w-full">
                            <TabsList className="grid w-full grid-cols-3 mb-4">
                                <TabsTrigger value="positive">Positive Scale (P)</TabsTrigger>
                                <TabsTrigger value="negative">Negative Scale (N)</TabsTrigger>
                                <TabsTrigger value="general">General Psychopathology (G)</TabsTrigger>
                            </TabsList>
                            <TabsContent value="positive" className="mt-0">
                                {renderScale(PANSS_ITEMS.P)}
                            </TabsContent>
                            <TabsContent value="negative" className="mt-0">
                                {renderScale(PANSS_ITEMS.N)}
                            </TabsContent>
                            <TabsContent value="general" className="mt-0">
                                {renderScale(PANSS_ITEMS.G)}
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </CollapsibleContent>
            </Card>
        </Collapsible>
    );
}
