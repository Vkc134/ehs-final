import { motion } from "framer-motion";

const gradientClasses = {
    primary: "gradient-primary",
    success: "gradient-success",
    warning: "gradient-warning",
    info: "gradient-info",
};

const StatCard = ({ title, value, icon: Icon, gradient, onClick }) => {
    return (
        <motion.div
            variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
            }}
            whileHover={{ y: -5, scale: 1.02, transition: { duration: 0.2 } }}
            className="group relative overflow-hidden rounded-2xl bg-card border border-border/50 shadow-card hover:shadow-card-hover transition-all duration-300 cursor-pointer"
            onClick={onClick}
        >
            {/* Gradient accent bar */}
            <div className={`absolute top-0 left-0 right-0 h-1 ${gradientClasses[gradient]}`} />

            <div className="p-6">
                <div className="flex items-start justify-between">
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">{title}</p>
                        <motion.p
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.4, delay: 0.2, type: "spring" }}
                            className="text-4xl font-bold text-foreground tracking-tight"
                        >
                            {value}
                        </motion.p>
                    </div>

                    <div
                        className={`flex h-12 w-12 items-center justify-center rounded-xl ${gradientClasses[gradient]} shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300`}
                    >
                        <Icon className="h-6 w-6 text-primary-foreground" />
                    </div>
                </div>
            </div>

            {/* Decorative background element */}
            <div
                className={`absolute -bottom-8 -right-8 h-32 w-32 rounded-full ${gradientClasses[gradient]} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}
            />
        </motion.div>
    );
};

export default StatCard;
