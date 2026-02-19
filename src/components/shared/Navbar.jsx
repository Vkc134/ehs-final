import { motion } from "framer-motion";
import { Activity, Bell, User, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";

const Navbar = ({ title = "Dashboard" }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <motion.header
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="sticky top-0 z-50 w-full border-b border-border/50 bg-card/80 backdrop-blur-xl"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo & Title */}
                    <div className="flex items-center gap-3">
                        <motion.div
                            whileHover={{ scale: 1.05, rotate: 5 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-lg shadow-blue-500/30 overflow-hidden"
                        >
                            <img src="/logo.png" alt="Logo" className="h-full w-full object-contain" />
                        </motion.div>
                        <div className="flex flex-col">
                            <span className="text-lg font-semibold text-foreground tracking-tight">
                                {title}
                            </span>
                            <span className="text-xs text-muted-foreground">
                                Employee Health Services
                            </span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        {/* Notifications */}
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="relative h-10 w-10 rounded-xl hover:bg-accent"
                            >
                                <Bell className="h-5 w-5 text-muted-foreground" />
                                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                                    <span className="relative inline-flex rounded-full h-4 w-4 bg-primary text-[10px] font-medium text-primary-foreground items-center justify-center">
                                        3
                                    </span>
                                </span>
                            </Button>
                        </motion.div>

                        {/* User Menu */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                    <Button
                                        variant="ghost"
                                        className="flex items-center gap-2 h-10 px-3 rounded-xl hover:bg-accent"
                                    >
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                                            <User className="h-4 w-4 text-primary" />
                                        </div>
                                        <div className="hidden sm:flex flex-col items-start text-left">
                                            <span className="text-sm font-medium text-foreground">
                                                {user?.email || "Guest"}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {user?.role || "Visitor"}
                                            </span>
                                        </div>
                                    </Button>
                                </motion.div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 bg-popover border-border shadow-lg">
                                <DropdownMenuItem className="cursor-pointer">
                                    <User className="mr-2 h-4 w-4" />
                                    Profile
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="cursor-pointer text-destructive focus:text-destructive"
                                    onClick={handleLogout}
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Logout
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>
        </motion.header>
    );
};

export default Navbar;
