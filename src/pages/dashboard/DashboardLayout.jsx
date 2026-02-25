import React from "react";
import Navbar from "@/components/shared/Navbar";

export default function DashboardLayout({ children }) {
    return (
        <div className="min-h-screen font-sans pb-20" style={{ background: "linear-gradient(135deg, #eff6ff 0%, #f0f9ff 40%, #f5f3ff 100%)" }}>
            <Navbar title="EHS Doctor Console" />
            <main className="p-4 md:p-6 lg:p-8">
                {children}
            </main>
        </div>
    );
}
