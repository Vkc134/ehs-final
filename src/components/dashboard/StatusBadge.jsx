import { motion } from "framer-motion";
import { CheckCircle2, Clock, UserCheck, FileText } from "lucide-react";

const statusConfig = {
    Created: {
        bg: "bg-muted",
        text: "text-muted-foreground",
        icon: FileText,
        iconColor: "text-muted-foreground",
    },
    "Vitals Recorded": {
        bg: "bg-info/10",
        text: "text-info",
        icon: Clock,
        iconColor: "text-info",
    },
    "Doctor Assigned": {
        bg: "bg-warning/10",
        text: "text-warning",
        icon: UserCheck,
        iconColor: "text-warning",
    },
    Completed: {
        bg: "bg-success/10",
        text: "text-success",
        icon: CheckCircle2,
        iconColor: "text-success",
    },
};

const StatusBadge = ({ status }) => {
    const config = statusConfig[status] || statusConfig.Created;
    const Icon = config.icon;

    return (
        <motion.span
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}
        >
            <Icon className={`h-3.5 w-3.5 ${config.iconColor}`} />
            {status}
        </motion.span>
    );
};

export default StatusBadge;
