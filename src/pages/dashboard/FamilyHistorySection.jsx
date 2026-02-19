import React, { useState, useRef } from "react";
import { Plus, X, User, HeartPulse, Baby } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function FamilyHistorySection({ initialNodes, onNodesChange }) {
    const [condition, setCondition] = useState("");
    const [relation, setRelation] = useState("");
    const [gender, setGender] = useState("Female");
    const conditionRef = useRef(null);

    const femaleRelations = ["mother", "sister", "grandmother", "daughter", "aunt", "wife", "maternal grandmother", "maternal aunt"];
    const maleRelations = ["father", "brother", "grandfather", "son", "uncle", "husband", "paternal grandfather", "paternal uncle"];

    const detectGender = (rel) => {
        const r = rel.toLowerCase();
        if (maleRelations.some(k => r.includes(k))) return "Male";
        if (femaleRelations.some(k => r.includes(k))) return "Female";
        return gender;
    };

    const handleRelationChange = (val) => {
        setRelation(val);
        setGender(detectGender(val));
    };

    const addNode = () => {
        if (!relation) return;

        // Find if this specific slot already exists
        const existingNodeIndex = initialNodes.findIndex(n => n.relation.toLowerCase() === relation.toLowerCase());

        const finalCondition = condition.trim() || "Healthy / No significant history";
        const isHealthy = !condition.trim();

        if (existingNodeIndex >= 0) {
            // Update existing
            const newNodes = [...initialNodes];
            newNodes[existingNodeIndex] = {
                ...newNodes[existingNodeIndex],
                condition: finalCondition,
                isHealthy,
                gender: gender // Update gender too
            };
            onNodesChange(newNodes);
        } else {
            // Add new
            const newItem = { condition: finalCondition, relation, gender, id: Date.now(), isHealthy };
            onNodesChange([...initialNodes, newItem]);
        }

        setCondition("");
        setRelation("");
    };

    const removeNode = (id) => {
        onNodesChange(initialNodes.filter((node) => node.id !== id));
    };

    const handleNodeClick = (relKey, defaultGender) => {
        const node = initialNodes.find(n => n.relation.toLowerCase() === relKey.toLowerCase());

        if (!node) {
            // Enable node if disabled
            const newItem = {
                condition: "Healthy / No significant history",
                relation: relKey,
                gender: defaultGender,
                id: Date.now(),
                isHealthy: true
            };
            onNodesChange([...initialNodes, newItem]);
            setRelation(relKey);
            setGender(defaultGender);
        } else {
            // Already enabled, select it in the form for editing condition
            setRelation(relKey);
            setGender(node.gender);
            setCondition(node.isHealthy ? "" : node.condition);
            if (conditionRef.current) {
                conditionRef.current.focus();
            }
        }
    };

    // Helper to find data for a specific relation/slot
    const findNodeBySlot = (slotKey) => {
        return initialNodes.find(n => n.relation.toLowerCase() === slotKey.toLowerCase());
    };

    const TreeNode = ({ relDisplay, relKey, gender: defaultGender, className = "" }) => {
        const node = findNodeBySlot(relKey);
        const isPresent = !!node;
        const currentGender = node?.gender || defaultGender;

        return (
            <div className={`flex flex-col items-center gap-1 group relative ${className}`}>
                <div
                    className={`
                        w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-300 z-10 cursor-pointer
                        ${isPresent
                            ? (node.isHealthy
                                ? "bg-green-500 border-green-400 text-white shadow-lg scale-110"
                                : (currentGender === "Male" ? "bg-blue-600 border-blue-400 text-white shadow-lg scale-110" : "bg-pink-600 border-pink-400 text-white shadow-lg scale-110"))
                            : "bg-white border-slate-200 text-slate-300 hover:border-orange-400 opacity-40 hover:opacity-100"
                        }
                    `}
                    onClick={() => handleNodeClick(relKey, defaultGender)}
                >
                    {currentGender === "Male" ? <span className="text-xl font-bold">♂</span> : <span className="text-xl font-bold">♀</span>}

                    {isPresent && (
                        <button
                            onClick={(e) => { e.stopPropagation(); removeNode(node.id); }}
                            className="absolute -top-1 -right-1 bg-white text-red-500 rounded-full p-0.5 shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-20"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    )}
                </div>
                <div className={`text-[9px] font-black uppercase text-center leading-tight tracking-tighter transition-colors
                    ${isPresent ? "text-slate-600" : "text-slate-300"}
                `}>
                    {relDisplay}
                </div>
                {isPresent && (
                    <div className={`mt-1 px-2 py-0.5 border rounded text-[10px] font-bold shadow-sm max-w-[90px] truncate text-center animate-in fade-in zoom-in duration-300 z-10
                        ${node.isHealthy ? "bg-green-50 border-green-200 text-green-700 font-medium italic" : "bg-white border-slate-200 text-slate-700"}
                    `}>
                        {node.condition}
                    </div>
                )}
            </div>
        );
    };

    return (
        <Card className="border-slate-200 shadow-2xl overflow-hidden bg-slate-50/20">
            <style dangerouslySetInnerHTML={{
                __html: `
                .tree-line-v { width: 2px; background: #e2e8f0; position: absolute; }
                .tree-line-h { height: 2px; background: #e2e8f0; position: absolute; }
                @keyframes pulse-sm { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.05); opacity: 0.8; } }
                .animate-pulse-sm { animation: pulse-sm 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
            `}} />
            <CardHeader className="py-4 px-6 bg-white border-b flex flex-row items-center justify-between">
                <div className="flex items-center gap-4">
                    <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                        <HeartPulse className="w-5 h-5 text-red-500" /> Pedigree Navigator
                    </CardTitle>
                    <div className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm border border-slate-200">
                        Total Members: <span className="text-blue-600 text-xs">{initialNodes.length}</span>
                    </div>
                </div>
                <div className="text-[10px] font-bold text-slate-300 uppercase italic">Interactive clinical view</div>
            </CardHeader>
            <CardContent className="p-6">

                {/* Visual Tree Visualization */}
                <div className="relative mb-8 p-10 bg-white rounded-3xl border border-slate-100 shadow-inner overflow-x-auto min-w-[800px]">
                    <div className="flex flex-col items-center relative">

                        {/* Connecting Lines */}
                        <div className="absolute top-[24px] left-[50%] -translate-x-1/2 w-[460px] tree-line-h" />
                        <div className="absolute top-[24px] left-[25%] -translate-x-1/2 h-[60px] tree-line-v" />
                        <div className="absolute top-[24px] left-[75%] -translate-x-1/2 h-[60px] tree-line-v" />
                        <div className="absolute top-[84px] left-[50%] -translate-x-1/2 w-[160px] tree-line-h" />
                        <div className="absolute top-[84px] left-[50%] -translate-x-1/2 h-[60px] tree-line-v" />
                        <div className="absolute top-[144px] left-[50%] -translate-x-1/2 w-[340px] tree-line-h border-dashed border-slate-200" />
                        <div className="absolute top-[144px] left-[28%] -translate-x-1/2 h-[10px] tree-line-v border-dashed border-slate-200" />
                        <div className="absolute top-[144px] left-[72%] -translate-x-1/2 h-[10px] tree-line-v border-dashed border-slate-200" />

                        {/* Descendants Hub */}
                        <div className="absolute top-[204px] left-[50%] -translate-x-1/2 h-[40px] tree-line-v border-dashed border-slate-200" />
                        <div className="absolute top-[244px] left-[50%] -translate-x-1/2 w-[240px] tree-line-h" />
                        <div className="absolute top-[244px] left-[35%] -translate-x-1/2 h-[10px] tree-line-v" />
                        <div className="absolute top-[244px] left-[50%] -translate-x-1/2 h-[10px] tree-line-v" />
                        <div className="absolute top-[244px] left-[65%] -translate-x-1/2 h-[10px] tree-line-v" />

                        {/* Grandparents Row */}
                        <div className="flex justify-between w-full mb-12 relative z-10 px-4">
                            <div className="flex gap-6">
                                <TreeNode relDisplay="Pat. G-Father" relKey="paternal grandfather" gender="Male" />
                                <TreeNode relDisplay="Pat. G-Mother" relKey="paternal grandmother" gender="Female" />
                            </div>
                            <div className="flex gap-6">
                                <TreeNode relDisplay="Mat. G-Father" relKey="maternal grandfather" gender="Male" />
                                <TreeNode relDisplay="Mat. G-Mother" relKey="maternal grandmother" gender="Female" />
                            </div>
                        </div>

                        {/* Parents Row */}
                        <div className="flex gap-40 mb-12 relative z-10">
                            <TreeNode relDisplay="Father" relKey="father" gender="Male" />
                            <TreeNode relDisplay="Mother" relKey="mother" gender="Female" />
                        </div>

                        {/* Siblings & Proband Row */}
                        <div className="flex items-center gap-14 mb-14 relative z-10">
                            {/* Dynamic Brothers */}
                            <div className="flex gap-4">
                                {initialNodes.filter(n => n.relation.toLowerCase().startsWith("brother")).map((n, i) => (
                                    <TreeNode key={n.id} relDisplay={`Brother ${i + 1}`} relKey={n.relation} gender="Male" />
                                ))}
                                {initialNodes.filter(n => n.relation.toLowerCase().startsWith("brother")).length === 0 && (
                                    <TreeNode relDisplay="Brother" relKey="brother" gender="Male" />
                                )}
                                <div
                                    className="w-10 h-10 rounded-full border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-300 hover:border-orange-400 hover:text-orange-400 cursor-pointer transition-all"
                                    onClick={() => handleNodeClick(`brother ${initialNodes.filter(n => n.relation.toLowerCase().startsWith("brother")).length + 1}`, "Male")}
                                >
                                    <Plus className="w-4 h-4" />
                                </div>
                            </div>

                            {/* Proband (Patient) */}
                            <div
                                className="relative group flex flex-col items-center cursor-pointer transition-all hover:scale-105"
                                onClick={() => handleNodeClick("patient", gender)}
                            >
                                <div className={`
                                    w-16 h-16 border-4 flex items-center justify-center shadow-2xl animate-pulse-sm rounded-2xl transition-all
                                    ${findNodeBySlot("patient")
                                        ? (findNodeBySlot("patient").isHealthy
                                            ? "bg-green-500 border-green-400 text-white"
                                            : (findNodeBySlot("patient").gender === "Male" ? "bg-blue-600 border-blue-400 text-white" : "bg-pink-600 border-pink-400 text-white"))
                                        : "bg-slate-900 border-slate-800 text-orange-400"}
                                `}>
                                    {(findNodeBySlot("patient")?.gender === "Male" || (!findNodeBySlot("patient") && gender === "Male")) ? <span className="text-3xl font-black">♂</span> : <span className="text-3xl font-black">♀</span>}
                                </div>
                                <div className="mt-2 px-3 py-0.5 bg-slate-900 rounded-full text-[9px] font-black text-white uppercase tracking-widest shadow-lg">
                                    Patient
                                </div>
                                {findNodeBySlot("patient") && (
                                    <div className={`mt-1 px-2 py-0.5 border rounded text-[10px] font-bold shadow-sm max-w-[100px] truncate text-center animate-in fade-in zoom-in
                                        ${findNodeBySlot("patient").isHealthy ? "bg-green-50 border-green-200 text-green-700 font-medium italic" : "bg-white border-slate-200 text-slate-700"}
                                    `}>
                                        {findNodeBySlot("patient").condition}
                                    </div>
                                )}
                            </div>

                            {/* Dynamic Sisters */}
                            <div className="flex gap-4">
                                {initialNodes.filter(n => n.relation.toLowerCase().startsWith("sister")).map((n, i) => (
                                    <TreeNode key={n.id} relDisplay={`Sister ${i + 1}`} relKey={n.relation} gender="Female" />
                                ))}
                                {initialNodes.filter(n => n.relation.toLowerCase().startsWith("sister")).length === 0 && (
                                    <TreeNode relDisplay="Sister" relKey="sister" gender="Female" />
                                )}
                                <div
                                    className="w-10 h-10 rounded-full border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-300 hover:border-orange-400 hover:text-orange-400 cursor-pointer transition-all"
                                    onClick={() => handleNodeClick(`sister ${initialNodes.filter(n => n.relation.toLowerCase().startsWith("sister")).length + 1}`, "Female")}
                                >
                                    <Plus className="w-4 h-4" />
                                </div>
                            </div>
                        </div>

                        {/* Descendants Row (Multi-Slot) */}
                        <div className="flex flex-col gap-10 items-center relative z-10 mt-2">
                            {/* Sons Row */}
                            <div className="flex gap-6 items-center">
                                <div className="text-[8px] font-black uppercase text-slate-300 tracking-tighter w-10 text-right">Sons</div>
                                <div className="flex gap-4">
                                    {initialNodes.filter(n => n.relation.toLowerCase().startsWith("son")).map((n, i) => (
                                        <TreeNode key={n.id} relDisplay={`Son ${i + 1}`} relKey={n.relation} gender="Male" />
                                    ))}
                                    {initialNodes.filter(n => n.relation.toLowerCase().startsWith("son")).length === 0 && (
                                        <TreeNode relDisplay="Son" relKey="son" gender="Male" />
                                    )}
                                    <div
                                        className="w-10 h-10 rounded-full border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-300 hover:border-orange-400 hover:text-orange-400 cursor-pointer transition-all"
                                        onClick={() => handleNodeClick(`son ${initialNodes.filter(n => n.relation.toLowerCase().startsWith("son")).length + 1}`, "Male")}
                                    >
                                        <Plus className="w-4 h-4" />
                                    </div>
                                </div>
                            </div>

                            {/* Daughters Row */}
                            <div className="flex gap-6 items-center">
                                <div className="text-[8px] font-black uppercase text-slate-300 tracking-tighter w-10 text-right">Daughters</div>
                                <div className="flex gap-4">
                                    {initialNodes.filter(n => n.relation.toLowerCase().startsWith("daughter")).map((n, i) => (
                                        <TreeNode key={n.id} relDisplay={`Daughter ${i + 1}`} relKey={n.relation} gender="Female" />
                                    ))}
                                    {initialNodes.filter(n => n.relation.toLowerCase().startsWith("daughter")).length === 0 && (
                                        <TreeNode relDisplay="Daughter" relKey="daughter" gender="Female" />
                                    )}
                                    <div
                                        className="w-10 h-10 rounded-full border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-300 hover:border-orange-400 hover:text-orange-400 cursor-pointer transition-all"
                                        onClick={() => handleNodeClick(`daughter ${initialNodes.filter(n => n.relation.toLowerCase().startsWith("daughter")).length + 1}`, "Female")}
                                    >
                                        <Plus className="w-4 h-4" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Input Controls */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end bg-white p-6 rounded-2xl border border-slate-200 shadow-xl relative z-20">
                    <div className="md:col-span-4">
                        <label className="text-[10px] font-black uppercase text-slate-500 mb-2 block tracking-widest">Medical Condition</label>
                        <Input
                            ref={conditionRef}
                            placeholder="e.g. Hypertension (Leave blank for healthy)"
                            value={condition}
                            onChange={e => setCondition(e.target.value)}
                            className="h-12 border-slate-200 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all font-semibold"
                        />
                    </div>
                    <div className="md:col-span-3">
                        <label className="text-[10px] font-black uppercase text-slate-500 mb-2 block tracking-widest">Bio-Relation</label>
                        <Input
                            placeholder="Click tree or type"
                            value={relation}
                            onChange={e => setRelation(e.target.value)}
                            className="h-12 border-slate-200 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all font-semibold"
                        />
                    </div>
                    <div className="md:col-span-3">
                        <label className="text-[10px] font-black uppercase text-slate-500 mb-2 block tracking-widest">Gender</label>
                        <Select value={gender} onValueChange={setGender}>
                            <SelectTrigger className="h-12 border-slate-200 bg-white font-semibold">
                                <SelectValue placeholder="Gender" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Male" className="font-semibold">Male (♂)</SelectItem>
                                <SelectItem value="Female" className="font-semibold">Female (♀)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="md:col-span-2">
                        <Button
                            onClick={addNode}
                            className="w-full h-12 bg-orange-600 hover:bg-orange-700 text-white font-black uppercase tracking-widest transition-all transform active:scale-95 shadow-xl shadow-orange-600/30"
                        >
                            <Plus className="w-5 h-5 mr-1" /> Save Info
                        </Button>
                    </div>
                </div>

                {/* Extended Family (Non-Tree) */}
                {initialNodes.some(n => !["mother", "father", "grandfather", "grandmother", "mom", "dad", "brother", "sister", "son", "daughter"].some(k => n.relation.toLowerCase().includes(k))) && (
                    <div className="mt-8">
                        <div className="text-[9px] font-black uppercase text-slate-400 mb-3 tracking-widest px-1">Other Family Members</div>
                        <div className="flex flex-wrap gap-2">
                            {initialNodes
                                .filter(n => !["mother", "father", "grandfather", "grandmother", "mom", "dad", "brother", "sister", "son", "daughter"].some(k => n.relation.toLowerCase().includes(k)))
                                .map(node => (
                                    <div key={node.id} className="group flex items-center gap-2 bg-white px-4 py-2 rounded-xl text-[11px] font-bold border border-slate-200 shadow-sm hover:border-orange-300 transition-all">
                                        <span className={node.gender === "Male" ? "text-blue-600" : "text-pink-600"}>
                                            {node.gender === "Male" ? "♂" : "♀"}
                                        </span>
                                        <span className="text-slate-500">{node.relation}:</span>
                                        <span className={node.isHealthy ? "text-green-600 italic" : "text-slate-900"}>{node.condition}</span>
                                        <button onClick={() => removeNode(node.id)} className="ml-1 text-slate-300 hover:text-red-500 transition-colors">
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
