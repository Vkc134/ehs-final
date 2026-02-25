import { motion } from "framer-motion";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

const widthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
};

const FormDialog = ({
    open,
    onOpenChange,
    title,
    icon,
    children,
    maxWidth = "md",
}) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className={`${widthClasses[maxWidth]} p-0 overflow-hidden border-border/50 shadow-xl bg-card`}
            >
                {/* Header */}
                <DialogHeader className="px-6 py-5 border-b border-border bg-gradient-to-r from-primary/5 via-transparent to-transparent">
                    <div className="flex items-center gap-3">
                        {icon && (
                            <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary shadow-lg"
                            >
                                {icon}
                            </motion.div>
                        )}
                        <DialogTitle className="text-xl font-semibold text-foreground">
                            {title}
                        </DialogTitle>
                    </div>
                </DialogHeader>

                {/* Content */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="px-6 py-5"
                >
                    {children}
                </motion.div>
            </DialogContent>
        </Dialog>
    );
};

export default FormDialog;
