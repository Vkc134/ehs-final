import React, { useEffect, useState } from "react";
import axiosInstance from "@/api/axios";
import Navbar from "@/components/shared/Navbar";
import {
    Card, CardContent, CardHeader, CardTitle, CardDescription
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Pill, FileText, BarChart3, Search, Filter,
    ChevronRight, Printer, User, Users
} from "lucide-react";
import { toast } from "sonner";
import SummaryCards from "./pharmacy/SummaryCards";
import PrescriptionCard from "./pharmacy/PrescriptionCard";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, AreaChart, Area
} from 'recharts';
import PrescriptionDetailModal from "./pharmacy/PrescriptionDetailModal";
import PrescriptionPrintView from "./pharmacy/PrescriptionPrintView";

export default function PharmacyDashboard() {
    const [prescriptions, setPrescriptions] = useState([]);
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState("prescriptions");
    const [selectedPrescription, setSelectedPrescription] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [statusFilter, setStatusFilter] = useState("all");

    // Summary Card Filters
    const [totalRxFilter, setTotalRxFilter] = useState("all");
    const [pendingRxFilter, setPendingRxFilter] = useState("all");
    const [dispensedFilter, setDispensedFilter] = useState("today");
    const [patientsFilter, setPatientsFilter] = useState("today");

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 15000);
        return () => clearInterval(interval);
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [rxRes, ptRes] = await Promise.all([
                axiosInstance.get("/prescriptions"),
                axiosInstance.get("/patients")
            ]);

            // Only signed (locked) prescriptions for pharmacist
            const signed = rxRes.data.filter(p => p.isSigned === true);
            setPrescriptions(signed);
            setPatients(ptRes.data);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load dashboard data");
        } finally {
            setLoading(false);
        }
    };

    const handleDispense = async (id) => {
        try {
            await axiosInstance.patch(`/prescriptions/${id}/dispense`);
            toast.success("Prescription dispensed successfully");
            fetchData();
            if (selectedPrescription?.prescriptionId === id) {
                setIsModalOpen(false);
            }
        } catch (err) {
            toast.error("Failed to dispense prescription");
        }
    };

    const handleView = (rx) => {
        setSelectedPrescription(rx);
        setIsModalOpen(true);
    };

    const handlePrint = (rx) => {
        setSelectedPrescription(rx);
        // Give react time to render the print view if it was null
        setTimeout(() => {
            window.print();
        }, 100);
    };

    /* ================= STATS CALCULATION ================= */
    const getFilteredCount = (data, filter, isDispensedOnly = false, isPatientCount = false) => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

        let filtered = data;
        if (isDispensedOnly) {
            filtered = filtered.filter(p => p.isDispensed);
        }

        filtered = filtered.filter(p => {
            const date = new Date(p.createdAt);
            switch (filter) {
                case "today":
                    return date.toDateString() === now.toDateString();
                case "week":
                    return date >= startOfWeek;
                case "month":
                    return date >= startOfMonth;
                case "lastMonth":
                    return date >= startOfLastMonth && date <= endOfLastMonth;
                case "all":
                default:
                    return true;
            }
        });

        if (isPatientCount) {
            // Uhid might be in prescription.visit.patientId
            return new Set(filtered.map(p => p.visit?.patientId || p.uhid)).size;
        }
        return filtered.length;
    };

    const stats = {
        total: getFilteredCount(prescriptions, totalRxFilter),
        totalFilter: totalRxFilter,
        setTotalFilter: setTotalRxFilter,

        pending: prescriptions.filter(p => !p.isDispensed).length,
        pendingFilter: pendingRxFilter,
        setPendingFilter: setPendingRxFilter,

        dispensed: getFilteredCount(prescriptions, dispensedFilter, true),
        dispensedFilter: dispensedFilter,
        setDispensedFilter: setDispensedFilter,

        patients: getFilteredCount(prescriptions, patientsFilter, false, true),
        patientsFilter: patientsFilter,
        setPatientsFilter: setPatientsFilter,
    };

    /* ================= FILTERED LISTS ================= */
    const filteredPrescriptions = prescriptions.filter(p => {
        const patientName = p.visit ? `${p.visit.patientFirstName} ${p.visit.patientLastName}` : "";
        const matchesSearch =
            patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.prescriptionId?.toString().includes(searchQuery.toLowerCase());

        const matchesStatus =
            statusFilter === "all" ||
            (statusFilter === "pending" && !p.isDispensed) ||
            (statusFilter === "dispensed" && p.isDispensed);

        return matchesSearch && matchesStatus;
    });

    return (
        <div className="min-h-screen bg-slate-50 pb-12">
            <Navbar title="Pharmacy Management" />

            <div className="max-w-7xl mx-auto px-6 py-8">

                {/* TOP SUMMARY CARDS */}
                <SummaryCards stats={stats} />

                <Tabs defaultValue="prescriptions" onValueChange={setActiveTab} className="space-y-6">
                    <div className="flex justify-between items-center">
                        <TabsList className="bg-white border p-1 h-12">
                            <TabsTrigger value="prescriptions" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white h-10 px-6 gap-2">
                                <FileText size={18} />
                                Prescriptions
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    {/* PRESCRIPTIONS TAB */}
                    <TabsContent value="prescriptions" className="space-y-6">
                        <div className="flex gap-4 items-center bg-white p-4 rounded-xl border shadow-sm">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <Input
                                    placeholder="Search by patient, medication, or prescription ID..."
                                    className="pl-10 h-11 bg-slate-50 border-none focus-visible:ring-1"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <Select defaultValue="all" value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[200px] h-11 bg-slate-50 border-none">
                                    <SelectValue placeholder="All Statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="dispensed">Fully Dispensed</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button variant="outline" className="h-11 gap-2 bg-slate-50 border-none">
                                <Filter size={18} />
                                More Filters
                            </Button>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center px-1">
                                <p className="text-sm font-medium text-slate-500">Showing {filteredPrescriptions.length} prescriptions</p>
                            </div>

                            <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                <div className="col-span-2">Prescription</div>
                                <div className="col-span-2">Patient</div>
                                <div className="col-span-2">Doctor</div>
                                <div className="col-span-2">Medications</div>
                                <div className="col-span-2">Status</div>
                                <div className="col-span-2 text-right">Actions</div>
                            </div>

                            {loading && prescriptions.length === 0 ? (
                                <div className="text-center py-12 text-slate-500">Loading prescriptions...</div>
                            ) : filteredPrescriptions.length === 0 ? (
                                <div className="text-center py-12 bg-white rounded-xl border border-dashed text-slate-500">
                                    No prescriptions found matching your criteria.
                                </div>
                            ) : (
                                filteredPrescriptions.map(rx => (
                                    <PrescriptionCard
                                        key={rx.prescriptionId}
                                        rx={rx}
                                        onDispense={handleDispense}
                                        onView={handleView}
                                        onPrint={handlePrint}
                                    />
                                ))
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Detail Modal */}
            <PrescriptionDetailModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                rx={selectedPrescription}
                onDispense={handleDispense}
            />

            {/* Hidden Print View */}
            <PrescriptionPrintView rx={selectedPrescription} />
        </div>
    );
}
