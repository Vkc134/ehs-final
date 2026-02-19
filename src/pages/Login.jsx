import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Stethoscope, Activity, Lock, Mail, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";

const formSchema = z.object({
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5266";
const API = `${API_URL}/auth/login`; // Matches backend endpoint

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const onSubmit = async (values) => {
        setIsLoading(true);
        try {
            const response = await axios.post(API, values);
            const { token, user } = response.data;

            login(token, user);
            toast.success(`Welcome back, ${user.role}!`);

            if (user.role === "Doctor") {
                navigate("/doctor");
            } else if (user.role === "Nurse") {
                navigate("/nurse");
            } else if (user.role === "Pharmacist") {
                navigate("/pharmacy");
            } else {
                navigate("/"); // Fallback
            }
        } catch (error) {
            console.error(error);
            if (error.response?.status === 401) {
                toast.error("Invalid credentials");
            } else {
                toast.error("Something went wrong. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-50">
            {/* Animated Background Mesh */}
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyan-400/20 via-blue-500/20 to-indigo-500/20 animate-pulse-slow"></div>
            <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-300/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
            <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-yellow-300/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-[-20%] left-[20%] w-[500px] h-[500px] bg-pink-300/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
                className="w-full max-w-md p-4"
            >
                <Card className="border border-white/20 shadow-2xl bg-white/70 backdrop-blur-xl relative overflow-hidden">
                    {/* Decorative top bar */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500"></div>

                    <CardHeader className="space-y-1 flex flex-col items-center pb-2 pt-8">
                        <motion.div
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white p-3 rounded-2xl shadow-lg mb-4"
                        >
                            <img src="/logo.png" alt="Logo" className="w-16 h-16 object-contain" />
                        </motion.div>
                        <CardTitle className="text-3xl font-extrabold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                            CareConnect Hub
                        </CardTitle>
                        <CardDescription className="text-center text-slate-600 font-medium">
                            Secure Healthcare Personnel Access
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-slate-700">Email Address</FormLabel>
                                            <FormControl>
                                                <motion.div
                                                    initial={{ x: -20, opacity: 0 }}
                                                    animate={{ x: 0, opacity: 1 }}
                                                    transition={{ delay: 0.3 }}
                                                    className="relative group"
                                                >
                                                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
                                                    <Input
                                                        className="pl-9 bg-white/50 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-300"
                                                        placeholder="doctor@hospital.com"
                                                        {...field}
                                                    />
                                                </motion.div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-slate-700">Password</FormLabel>
                                            <FormControl>
                                                <motion.div
                                                    initial={{ x: -20, opacity: 0 }}
                                                    animate={{ x: 0, opacity: 1 }}
                                                    transition={{ delay: 0.4 }}
                                                    className="relative group"
                                                >
                                                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
                                                    <Input
                                                        type={showPassword ? "text" : "password"}
                                                        className="pl-9 pr-10 bg-white/50 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-300"
                                                        placeholder="••••••"
                                                        {...field}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        className="absolute right-3 top-2.5 text-slate-400 hover:text-blue-600 focus:outline-none transition-colors"
                                                    >
                                                        {showPassword ? (
                                                            <EyeOff className="h-4 w-4" />
                                                        ) : (
                                                            <Eye className="h-4 w-4" />
                                                        )}
                                                    </button>
                                                </motion.div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                >
                                    <Button
                                        type="submit"
                                        className="w-full mt-4 h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/30 transition-all duration-300 transform hover:-translate-y-0.5"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <div className="flex items-center gap-2">
                                                <span className="h-4 w-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                                                Verifying...
                                            </div>
                                        ) : (
                                            "Sign In to Dashboard"
                                        )}
                                    </Button>
                                </motion.div>
                            </form>
                        </Form>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4 text-center mt-2 pb-6">
                        <div className="text-xs text-slate-500 flex items-center gap-1 justify-center">
                            <Lock className="w-3 h-3" />
                            <span>AES-256 Encrypted Connection</span>
                        </div>
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest">
                            Authorized Personnel Only
                        </p>
                    </CardFooter>
                </Card>
            </motion.div>
        </div>
    );
}
