import { motion } from "framer-motion";
import { Users, Mail, Phone, Calendar, Search } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

const PatientsTable = ({ patients, onView, onSearch }) => {
    return (
        <div className="rounded-2xl overflow-hidden bg-card border border-border/50 shadow-card">
            {/* Header */}
            <div className="px-6 py-4 border-b border-border bg-gradient-to-r from-info/5 to-transparent">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-info">
                            <Users className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-foreground">All Patients</h3>
                            <p className="text-sm text-muted-foreground">
                                {patients.length} registered {patients.length === 1 ? "patient" : "patients"}
                            </p>
                        </div>
                    </div>
                    {/* Inline Search */}
                    <div className="relative flex-1 max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search patients..."
                            onChange={(e) => onSearch?.(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto max-h-[420px] overflow-y-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/30 hover:bg-muted/30">
                            <TableHead className="font-semibold text-foreground">Name</TableHead>
                            <TableHead className="font-semibold text-foreground">Date of Birth</TableHead>
                            <TableHead className="font-semibold text-foreground">Phone</TableHead>
                            <TableHead className="font-semibold text-foreground">Email</TableHead>
                            <TableHead className="font-semibold text-foreground text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {patients.map((patient) => (
                            <motion.tr
                                key={patient.patientId}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ type: "spring", stiffness: 100 }}
                                className="group hover:bg-accent/50 transition-colors duration-200"
                            >
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary font-semibold text-sm">
                                            {patient.patientFirstName[0]}{patient.patientLastName[0]}
                                        </div>
                                        <span className="font-medium text-foreground">
                                            {patient.patientFirstName} {patient.patientLastName}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Calendar className="h-4 w-4" />
                                        {patient.dateOfBirth
                                            ? new Date(patient.dateOfBirth).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                                            : "—"}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Phone className="h-4 w-4" />
                                        {patient.phoneNumber || "—"}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Mail className="h-4 w-4" />
                                        {patient.email || "—"}
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <button
                                        onClick={() => onView(patient)}
                                        className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-1.5 rounded-lg transition-colors border border-slate-200"
                                    >
                                        View
                                    </button>
                                </TableCell>
                            </motion.tr>
                        ))}

                        {patients.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="h-32 text-center">
                                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                        <Users className="h-8 w-8 opacity-50" />
                                        <p className="font-medium">No patients found</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};

export default PatientsTable;
