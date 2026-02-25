import { motion } from "framer-motion";
import { Eye, Stethoscope, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import StatusBadge from "./StatusBadge";
import PriorityBadge from "./PriorityBadge";

const VisitsTable = ({ visits, onRecordVitals, onPreview, onUpload }) => {
    return (
        <div className="rounded-2xl overflow-hidden bg-card border border-border/50 shadow-card">
            {/* Header */}
            <div className="px-6 py-4 border-b border-border bg-gradient-to-r from-primary/5 to-transparent">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary">
                        <Calendar className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-foreground">Today's Active Visits</h3>
                        <p className="text-sm text-muted-foreground">
                            {visits.length} {visits.length === 1 ? "visit" : "visits"} today
                        </p>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto max-h-[420px] overflow-y-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/30 hover:bg-muted/30">
                            <TableHead className="font-semibold text-foreground">ID</TableHead>
                            <TableHead className="font-semibold text-foreground">Patient</TableHead>
                            <TableHead className="font-semibold text-foreground">Time</TableHead>
                            <TableHead className="font-semibold text-foreground">Priority</TableHead>
                            <TableHead className="font-semibold text-foreground">Status</TableHead>
                            <TableHead className="text-center font-semibold text-foreground">Actions</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody
                        as={motion.tbody}
                        initial="hidden"
                        animate="visible"
                        variants={{
                            visible: { transition: { staggerChildren: 0.05 } }
                        }}
                    >
                        {visits.map((visit) => (
                            <motion.tr
                                key={visit.visitId}
                                variants={{
                                    hidden: { opacity: 0, x: -20 },
                                    visible: { opacity: 1, x: 0 }
                                }}
                                transition={{ type: "spring", stiffness: 100 }}
                                className="group hover:bg-accent/50 transition-colors duration-200"
                            >
                                <TableCell className="font-mono text-sm text-muted-foreground">
                                    #{visit.visitId}
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-medium text-foreground">
                                            {visit.patientName}
                                        </span>
                                        {visit.dateOfBirth && (
                                            <span className="text-xs text-muted-foreground">
                                                DOB: {visit.dateOfBirth}
                                            </span>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                    {new Date(visit.createdAt || visit.createdOn || "").toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </TableCell>
                                <TableCell>
                                    <PriorityBadge priority={visit.priority} />
                                </TableCell>
                                <TableCell>
                                    <StatusBadge status={visit.status} />
                                </TableCell>
                                <TableCell>
                                    <div className="flex justify-center gap-2">
                                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                                            <Button
                                                size="sm"
                                                disabled={["Doctor Assigned", "Completed"].includes(visit.status)}
                                                onClick={() => onRecordVitals(visit)}
                                                className="gap-1.5 rounded-lg gradient-primary text-primary-foreground hover:opacity-90 disabled:opacity-50"
                                            >
                                                <Stethoscope className="h-4 w-4" />
                                                Record
                                            </Button>
                                        </motion.div>
                                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => onUpload(visit)}
                                                className="gap-1.5 rounded-lg border-border hover:bg-accent hover:border-primary/50 text-xs px-2"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" /></svg>
                                                Attach
                                            </Button>
                                        </motion.div>
                                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                                            <Button
                                                size="icon"
                                                variant="outline"
                                                onClick={() => onPreview(visit.visitId)}
                                                className="h-9 w-9 rounded-lg border-border hover:bg-accent hover:border-primary/50"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        </motion.div>
                                    </div>
                                </TableCell>
                            </motion.tr>
                        ))}

                        {visits.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="h-32 text-center">
                                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                        <Calendar className="h-8 w-8 opacity-50" />
                                        <p className="font-medium">No visits created today</p>
                                        <p className="text-sm">Create a new visit to get started</p>
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

export default VisitsTable;
