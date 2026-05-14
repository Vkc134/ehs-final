import { motion } from "framer-motion";
import { AlertTriangle, CircleDot } from "lucide-react";

const PriorityBadge = ({ priority }) => {
    if (priority === "Emergency") {
        return (
            <motion.span
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emergency/10 text-emergency"
            >
                <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                >
                    <AlertTriangle className="h-3.5 w-3.5" />
                </motion.div>
                Emergency
            </motion.span>
        );
    }

    return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
            <CircleDot className="h-3.5 w-3.5" />
            Normal
        </span>
    );
};

export default PriorityBadge;
