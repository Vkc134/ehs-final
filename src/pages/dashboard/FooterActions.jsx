import React from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, Save, Printer, Loader2, Paperclip } from "lucide-react";

export default function FooterActions({ onSave, onEndConsultation, onPrint, isLoading, attachmentPath }) {
    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t py-4 px-8 flex justify-between items-center z-50 shadow-lg">
            <div className="text-sm text-slate-500 hidden md:block">
                CareConnect EMR • Auto-save enabled
            </div>
            <div className="flex gap-4">
                <Button variant="outline" size="lg" onClick={onPrint}>
                    <Printer className="w-5 h-5 mr-2" /> Print Preview
                </Button>

                {attachmentPath && (
                    <a
                        href={`${import.meta.env.VITE_API_URL || "http://localhost:5266"}${attachmentPath.startsWith("/") ? "" : "/"}${attachmentPath}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium mr-4"
                    >
                        <Paperclip className="w-4 h-4" />
                        View Attachment
                    </a>
                )}
                {/* Save Draft Removed */}
                <Button
                    size="lg"
                    className="bg-green-600 hover:bg-green-700 text-white min-w-[200px] shadow-lg shadow-green-200"
                    onClick={onEndConsultation}
                    disabled={isLoading}
                >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <CheckCircle className="w-5 h-5 mr-2" />}
                    Sign & Finish
                </Button>
            </div>
        </div>
    );
}
