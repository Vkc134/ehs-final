import "../techtalk.css";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Rocket, Users, CheckCircle2, ChevronDown, Upload, FileText, X } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const PPT_TOPICS = ["Career Plan", "Project Idea", "Technology of Interest"];
const YEAR_OPTIONS = ["3rd Year", "4th Year"];

export default function TechTalkRegistration() {
    const [settings, setSettings] = useState(null);
    const [loadingSettings, setLoadingSettings] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [submittedName, setSubmittedName] = useState("");
    const [pptUploaded, setPptUploaded] = useState(false);

    const [form, setForm] = useState({
        fullName: "",
        email: "",
        phone: "",
        college: "",
        yearOfStudy: "",
        pptTopic: "",
        referredBy: "",
    });
    const [pptFile, setPptFile] = useState(null);
    const [errors, setErrors] = useState({});
    const fileInputRef = useRef(null);

    const fetchSettings = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/techtalk/settings`);
            if (res.ok) setSettings(await res.json());
        } catch (e) {
            console.error("Failed to fetch settings", e);
        } finally {
            setLoadingSettings(false);
        }
    };

    useEffect(() => {
        fetchSettings();
        const interval = setInterval(fetchSettings, 15000);
        return () => clearInterval(interval);
    }, []);

    const validate = () => {
        const e = {};
        if (!form.fullName.trim()) e.fullName = "Full name is required.";
        if (!form.email.trim()) e.email = "Email is required.";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
            e.email = "Enter a valid email address.";
        if (!form.phone.trim()) e.phone = "Phone number is required.";
        else if (!/^\d{10}$/.test(form.phone.replace(/\s/g, "")))
            e.phone = "Enter a valid 10-digit phone number.";
        if (!form.college.trim()) e.college = "College name is required.";
        if (!form.yearOfStudy) e.yearOfStudy = "Please select your year.";
        if (!form.pptTopic) e.pptTopic = "Please select a PPT topic.";
        // PPT file validation
        if (pptFile) {
            const ext = pptFile.name.split(".").pop().toLowerCase();
            if (!["ppt", "pptx", "pdf"].includes(ext))
                e.pptFile = "Only .ppt, .pptx, or .pdf files are allowed.";
            else if (pptFile.size > 20 * 1024 * 1024)
                e.pptFile = "File must be under 20 MB.";
        }
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleChange = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const ext = file.name.split(".").pop().toLowerCase();
        if (!["ppt", "pptx", "pdf"].includes(ext)) {
            setErrors((prev) => ({ ...prev, pptFile: "Only .ppt, .pptx, or .pdf allowed." }));
            setPptFile(null);
            return;
        }
        if (file.size > 20 * 1024 * 1024) {
            setErrors((prev) => ({ ...prev, pptFile: "File must be under 20 MB." }));
            setPptFile(null);
            return;
        }
        setPptFile(file);
        setErrors((prev) => ({ ...prev, pptFile: undefined }));
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) handleFileChange({ target: { files: [file] } });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setSubmitting(true);

        try {
            // Use FormData for multipart (supports PPT file upload)
            const fd = new FormData();
            fd.append("fullName", form.fullName.trim());
            fd.append("email", form.email.trim());
            fd.append("phone", form.phone.trim());
            fd.append("college", form.college.trim());
            fd.append("yearOfStudy", form.yearOfStudy);
            fd.append("pptTopic", form.pptTopic);
            fd.append("referredBy", form.referredBy.trim());
            if (pptFile) fd.append("pptFile", pptFile);

            const res = await fetch(`${API_BASE}/api/techtalk/register`, {
                method: "POST",
                body: fd,
            });

            const data = await res.json();

            if (res.ok) {
                setSubmittedName(form.fullName.trim());
                setPptUploaded(data.pptUploaded);
                setSubmitted(true);
                fetchSettings();
            } else {
                toast.error(data.message || "Registration failed. Please try again.");
            }
        } catch {
            toast.error("Network error. Check your connection and try again.");
        } finally {
            setSubmitting(false);
        }
    };

    // ── Seat progress bar ──────────────────────────────────────────────────────
    const CapacityBar = () => {
        if (!settings) return null;
        const pct = Math.min(100, Math.round((settings.registeredCount / settings.maxCapacity) * 100));
        const color = pct >= 90 ? "bg-red-500" : pct >= 70 ? "bg-amber-400" : "bg-emerald-400";
        return (
            <div className="tt-capacity-wrap">
                <div className="tt-capacity-labels">
                    <span className="tt-seats-filled">
                        <Users size={14} />
                        {settings.registeredCount} registered
                    </span>
                    <span className="tt-seats-remaining">{settings.remainingSeats} seats left</span>
                </div>
                <div className="tt-bar-bg">
                    <div className={`tt-bar-fill ${color}`} style={{ width: `${pct}%` }} />
                </div>
                <div className="tt-capacity-subtitle">Total capacity: {settings.maxCapacity}</div>
            </div>
        );
    };

    // ── Blocking states ────────────────────────────────────────────────────────
    if (!loadingSettings && settings && !settings.isOpen)
        return <ClosedWall title="Registrations Closed" msg="The admin has temporarily closed registrations. Check back soon!" />;
    if (!loadingSettings && settings && settings.isFull)
        return <ClosedWall title="All Seats Filled 🎉" msg="We've reached maximum capacity for Tech Talk 2026. Stay tuned for future events!" isFull />;

    // ── Success screen ─────────────────────────────────────────────────────────
    if (submitted) {
        return (
            <div className="tt-page">
                <div className="tt-orb tt-orb-1" />
                <div className="tt-orb tt-orb-2" />
                <div className="tt-success-card">
                    <div className="tt-success-icon">🚀</div>
                    <h2 className="tt-success-title">You're In, {submittedName}!</h2>
                    <p className="tt-success-msg">
                        Your spot at <strong>Tech Talk 2026</strong> is secured. Prepare your PPT and get
                        ready to level up your tech career!
                    </p>
                    <div className="tt-success-checklist">
                        <div className="tt-check-item">
                            <CheckCircle2 size={16} className="tt-check-icon" /> Registration confirmed
                        </div>
                        <div className="tt-check-item">
                            <CheckCircle2 size={16} className="tt-check-icon" />
                            {pptUploaded ? "PPT uploaded successfully ✅" : "PPT submission required before the session"}
                        </div>
                        <div className="tt-check-item">
                            <CheckCircle2 size={16} className="tt-check-icon" /> Visit <strong>www.cloudpyit.com</strong> for updates
                        </div>
                    </div>
                    <button
                        className="tt-btn-secondary"
                        onClick={() => {
                            setSubmitted(false);
                            setPptFile(null);
                            setForm({ fullName: "", email: "", phone: "", college: "", yearOfStudy: "", pptTopic: "", referredBy: "" });
                        }}
                    >
                        Register Another Person
                    </button>
                </div>
            </div>
        );
    }

    // ── Form ───────────────────────────────────────────────────────────────────
    return (
        <div className="tt-page">
            <div className="tt-orb tt-orb-1" />
            <div className="tt-orb tt-orb-2" />
            <div className="tt-orb tt-orb-3" />

            <div className="tt-container">
                {/* Header */}
                <div className="tt-header">
                    <div className="tt-logo-badge">
                        <div className="tt-logo-icon">☁</div>
                        <span className="tt-logo-text">Cloudpyit</span>
                    </div>
                    <div className="tt-title-row">
                        <Rocket className="tt-rocket" size={36} />
                        <h1 className="tt-main-title">Tech Talk 2026</h1>
                    </div>
                    <div className="tt-subtitle-badge">PPT SUBMISSION REQUIRED</div>
                    <p className="tt-eligibility">
                        🎓 Exclusively for <strong>B.Tech 3rd &amp; 4th Year</strong> Students
                    </p>
                    <p className="tt-description">
                        Free Tech Talk Session aimed at guiding students from{" "}
                        <span className="tt-highlight">Scratch to Advanced (Pro) Level</span> in the
                        Software Industry.
                    </p>
                </div>

                {/* Capacity bar */}
                {loadingSettings ? (
                    <div className="tt-loading-bar"><div className="tt-pulse" /></div>
                ) : (
                    <CapacityBar />
                )}

                {/* Info cards */}
                <div className="tt-info-grid">
                    <div className="tt-info-card">
                        <p className="tt-info-label">Submit a short PPT on:</p>
                        <ul className="tt-topic-list">
                            {PPT_TOPICS.map((t) => (
                                <li key={t} className="tt-topic-item">
                                    <span className="tt-check-box">✓</span> {t}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="tt-info-card">
                        <p className="tt-info-label">This helps us to:</p>
                        <ul className="tt-topic-list">
                            <li className="tt-topic-item"><span className="tt-check-box-outline">☑</span> Understand your current level</li>
                            <li className="tt-topic-item"><span className="tt-check-box-outline">☑</span> Provide personalized guidance</li>
                            <li className="tt-topic-item"><span className="tt-check-box-outline">☑</span> Recommend tools &amp; roadmaps</li>
                        </ul>
                    </div>
                </div>

                {/* Registration form */}
                <div className="tt-form-card">
                    <h2 className="tt-form-title">Secure Your Spot</h2>
                    <p className="tt-form-subtitle">Fill in your details and upload your PPT to register</p>

                    <form onSubmit={handleSubmit} noValidate encType="multipart/form-data">
                        <div className="tt-form-grid">
                            {/* Full Name */}
                            <div className="tt-field">
                                <label className="tt-label">Full Name <span className="tt-req">*</span></label>
                                <input className={`tt-input ${errors.fullName ? "tt-input-error" : ""}`}
                                    placeholder="Enter your full name" value={form.fullName}
                                    onChange={(e) => handleChange("fullName", e.target.value)} />
                                {errors.fullName && <p className="tt-error-msg">{errors.fullName}</p>}
                            </div>

                            {/* Email */}
                            <div className="tt-field">
                                <label className="tt-label">Email Address <span className="tt-req">*</span></label>
                                <input className={`tt-input ${errors.email ? "tt-input-error" : ""}`}
                                    type="email" placeholder="your@email.com" value={form.email}
                                    onChange={(e) => handleChange("email", e.target.value)} />
                                {errors.email && <p className="tt-error-msg">{errors.email}</p>}
                            </div>

                            {/* Phone */}
                            <div className="tt-field">
                                <label className="tt-label">Phone Number <span className="tt-req">*</span></label>
                                <input className={`tt-input ${errors.phone ? "tt-input-error" : ""}`}
                                    type="tel" placeholder="10-digit mobile number" value={form.phone}
                                    onChange={(e) => handleChange("phone", e.target.value)} />
                                {errors.phone && <p className="tt-error-msg">{errors.phone}</p>}
                            </div>

                            {/* College */}
                            <div className="tt-field">
                                <label className="tt-label">College / University <span className="tt-req">*</span></label>
                                <input className={`tt-input ${errors.college ? "tt-input-error" : ""}`}
                                    placeholder="Your college name" value={form.college}
                                    onChange={(e) => handleChange("college", e.target.value)} />
                                {errors.college && <p className="tt-error-msg">{errors.college}</p>}
                            </div>

                            {/* Year of Study */}
                            <div className="tt-field">
                                <label className="tt-label">Year of Study <span className="tt-req">*</span></label>
                                <div className="tt-select-wrap">
                                    <select className={`tt-select ${errors.yearOfStudy ? "tt-input-error" : ""}`}
                                        value={form.yearOfStudy} onChange={(e) => handleChange("yearOfStudy", e.target.value)}>
                                        <option value="">Select year</option>
                                        {YEAR_OPTIONS.map((y) => <option key={y} value={y}>{y}</option>)}
                                    </select>
                                    <ChevronDown className="tt-select-icon" size={16} />
                                </div>
                                {errors.yearOfStudy && <p className="tt-error-msg">{errors.yearOfStudy}</p>}
                            </div>

                            {/* PPT Topic */}
                            <div className="tt-field">
                                <label className="tt-label">PPT Topic <span className="tt-req">*</span></label>
                                <div className="tt-select-wrap">
                                    <select className={`tt-select ${errors.pptTopic ? "tt-input-error" : ""}`}
                                        value={form.pptTopic} onChange={(e) => handleChange("pptTopic", e.target.value)}>
                                        <option value="">Select a topic</option>
                                        {PPT_TOPICS.map((t) => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                    <ChevronDown className="tt-select-icon" size={16} />
                                </div>
                                {errors.pptTopic && <p className="tt-error-msg">{errors.pptTopic}</p>}
                            </div>

                            {/* Referred By */}
                            <div className="tt-field tt-field-full">
                                <label className="tt-label">Referred By <span className="tt-optional">(optional)</span></label>
                                <input className="tt-input" placeholder="Name of person who referred you"
                                    value={form.referredBy} onChange={(e) => handleChange("referredBy", e.target.value)} />
                            </div>

                            {/* PPT Upload — full width */}
                            <div className="tt-field tt-field-full">
                                <label className="tt-label">
                                    Upload Your PPT <span className="tt-optional">(optional — .ppt, .pptx, .pdf · max 20 MB)</span>
                                </label>
                                <div
                                    className={`tt-file-drop ${errors.pptFile ? "tt-input-error" : ""} ${pptFile ? "tt-file-selected" : ""}`}
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={handleDrop}
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    {pptFile ? (
                                        <div className="tt-file-info">
                                            <FileText size={20} className="tt-file-icon-ok" />
                                            <span className="tt-file-name">{pptFile.name}</span>
                                            <span className="tt-file-size">({(pptFile.size / 1024 / 1024).toFixed(1)} MB)</span>
                                            <button
                                                type="button"
                                                className="tt-file-remove"
                                                onClick={(e) => { e.stopPropagation(); setPptFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="tt-file-placeholder">
                                            <Upload size={22} className="tt-upload-icon" />
                                            <span>Drag & drop your PPT here, or <span className="tt-browse-link">browse</span></span>
                                        </div>
                                    )}
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".ppt,.pptx,.pdf"
                                        style={{ display: "none" }}
                                        onChange={handleFileChange}
                                    />
                                </div>
                                {errors.pptFile && <p className="tt-error-msg">{errors.pptFile}</p>}
                            </div>
                        </div>

                        <button type="submit" className="tt-btn-submit" disabled={submitting}>
                            {submitting ? (
                                <span className="tt-btn-loading"><span className="tt-spinner" /> Registering…</span>
                            ) : (
                                "🚀 Register & Secure My Spot"
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer */}
                <div className="tt-footer">
                    <p className="tt-footer-url">🌐 www.cloudpyit.com</p>
                    <p className="tt-footer-tags">#TechTalk2026 · #CloudpyIT · #SoftwareCareers · #BTechStudents</p>
                </div>
            </div>
        </div>
    );
}

// ── Closed / Full Wall ─────────────────────────────────────────────────────
function ClosedWall({ title, msg, isFull }) {
    return (
        <div className="tt-page">
            <div className="tt-orb tt-orb-1" />
            <div className="tt-orb tt-orb-2" />
            <div className="tt-closed-card">
                <div className="tt-closed-icon">{isFull ? "🎯" : "🔒"}</div>
                <h2 className="tt-closed-title">{title}</h2>
                <p className="tt-closed-msg">{msg}</p>
                <a href="https://www.cloudpyit.com" target="_blank" rel="noopener noreferrer" className="tt-btn-link">
                    Visit cloudpyit.com
                </a>
            </div>
        </div>
    );
}
