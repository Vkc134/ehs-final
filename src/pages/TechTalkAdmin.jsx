import "../techtalk.css";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
    Users, Settings, Download, RefreshCw, ToggleLeft, ToggleRight,
    Trash2, ChevronUp, ChevronDown, Search, Shield, FileText
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

// ── Helper: export to CSV ───────────────────────────────────────────────────
function exportCSV(rows) {
    if (!rows.length) { toast.error("No data to export."); return; }
    const headers = ["#", "Full Name", "Email", "Phone", "College", "Year", "PPT Topic", "Referred By", "PPT File", "Registered At"];
    const csvRows = [
        headers.join(","),
        ...rows.map((r, i) =>
            [
                i + 1,
                `"${r.fullName}"`,
                `"${r.email}"`,
                `"${r.phone}"`,
                `"${r.college}"`,
                `"${r.yearOfStudy}"`,
                `"${r.pptTopic}"`,
                `"${r.referredBy || ""}"`,
                `"${r.pptOriginalName || "Not uploaded"}"`,
                `"${new Date(r.registeredAt).toLocaleString()}"`,
            ].join(",")
        ),
    ];
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `TechTalk2026_Registrations_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported successfully!");
}

// ── Extend Modal ────────────────────────────────────────────────────────────
function ExtendModal({ onClose, onExtend }) {
    const [custom, setCustom] = useState("");
    const presets = [10, 25, 50, 100];

    return (
        <div className="tt-modal-backdrop" onClick={onClose}>
            <div className="tt-modal" onClick={(e) => e.stopPropagation()}>
                <h3 className="tt-modal-title">Extend Registration Capacity</h3>
                <p className="tt-modal-desc">
                    Choose how many additional seats to add to the current capacity.
                </p>
                <div className="tt-modal-presets">
                    {presets.map((n) => (
                        <button key={n} className="tt-preset-btn" onClick={() => onExtend(n)}>
                            +{n}
                        </button>
                    ))}
                </div>
                <div className="tt-modal-custom">
                    <input
                        className="tt-input tt-modal-input"
                        type="number"
                        min="1"
                        max="500"
                        placeholder="Custom amount"
                        value={custom}
                        onChange={(e) => setCustom(e.target.value)}
                    />
                    <button
                        className="tt-btn-submit tt-modal-go"
                        onClick={() => {
                            const n = parseInt(custom, 10);
                            if (!n || n <= 0) { toast.error("Enter a valid positive number."); return; }
                            if (n > 500) { toast.error("Maximum extension per operation is 500."); return; }
                            onExtend(n);
                        }}
                    >
                        Apply
                    </button>
                </div>
                <button className="tt-btn-secondary tt-modal-cancel" onClick={onClose}>Cancel</button>
            </div>
        </div>
    );
}

// ── Main Admin Page ─────────────────────────────────────────────────────────
export default function TechTalkAdmin() {
    const [settings, setSettings] = useState(null);
    const [registrations, setRegistrations] = useState([]);
    const [filteredRows, setFilteredRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showExtendModal, setShowExtendModal] = useState(false);
    const [search, setSearch] = useState("");
    const [sortKey, setSortKey] = useState("registeredAt");
    const [sortAsc, setSortAsc] = useState(true);
    const [deletingId, setDeletingId] = useState(null);

    const fetchAll = useCallback(async () => {
        try {
            const [settingsRes, regsRes] = await Promise.all([
                fetch(`${API_BASE}/api/techtalk/settings`),
                fetch(`${API_BASE}/api/techtalk/registrations`),
            ]);
            if (settingsRes.ok) setSettings(await settingsRes.json());
            if (regsRes.ok) setRegistrations(await regsRes.json());
        } catch {
            toast.error("Failed to load data from server.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    // Filter + sort whenever data/search/sort changes
    useEffect(() => {
        const q = search.toLowerCase();
        let rows = registrations.filter(
            (r) =>
                r.fullName.toLowerCase().includes(q) ||
                r.email.toLowerCase().includes(q) ||
                r.college.toLowerCase().includes(q) ||
                r.pptTopic.toLowerCase().includes(q)
        );
        rows = [...rows].sort((a, b) => {
            let va = a[sortKey] ?? "";
            let vb = b[sortKey] ?? "";
            if (sortKey === "registeredAt") { va = new Date(va); vb = new Date(vb); }
            if (va < vb) return sortAsc ? -1 : 1;
            if (va > vb) return sortAsc ? 1 : -1;
            return 0;
        });
        setFilteredRows(rows);
    }, [registrations, search, sortKey, sortAsc]);

    const handleSort = (key) => {
        if (sortKey === key) setSortAsc((p) => !p);
        else { setSortKey(key); setSortAsc(true); }
    };

    const SortIcon = ({ k }) =>
        sortKey === k ? (sortAsc ? <ChevronUp size={13} /> : <ChevronDown size={13} />) : null;

    const handleToggle = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/techtalk/settings/toggle`, { method: "PATCH" });
            if (res.ok) {
                const data = await res.json();
                toast.success(data.message);
                setSettings((s) => ({ ...s, isOpen: data.isOpen }));
            } else {
                toast.error("Failed to toggle registration state.");
            }
        } catch {
            toast.error("Network error.");
        }
    };

    const handleExtend = async (amount) => {
        setShowExtendModal(false);
        try {
            const res = await fetch(`${API_BASE}/api/techtalk/settings/extend`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount }),
            });
            const data = await res.json();
            if (res.ok) {
                toast.success(data.message);
                setSettings((s) => ({
                    ...s,
                    maxCapacity: data.maxCapacity,
                    remainingSeats: data.remainingSeats,
                }));
            } else {
                toast.error(data.message || "Extension failed.");
            }
        } catch {
            toast.error("Network error.");
        }
    };

    const handleDelete = async (id, name) => {
        if (!confirm(`Remove ${name}'s registration? This cannot be undone.`)) return;
        setDeletingId(id);
        try {
            const res = await fetch(`${API_BASE}/api/techtalk/registrations/${id}`, { method: "DELETE" });
            if (res.ok) {
                setRegistrations((r) => r.filter((x) => x.id !== id));
                setSettings((s) => s ? { ...s, registeredCount: s.registeredCount - 1, remainingSeats: s.remainingSeats + 1 } : s);
                toast.success(`${name}'s registration removed.`);
            } else {
                toast.error("Failed to delete registration.");
            }
        } catch {
            toast.error("Network error.");
        } finally {
            setDeletingId(null);
        }
    };

    const pct = settings
        ? Math.min(100, Math.round((settings.registeredCount / settings.maxCapacity) * 100))
        : 0;

    return (
        <div className="tt-admin-page">
            {/* Animated bg */}
            <div className="tt-orb tt-orb-1" />
            <div className="tt-orb tt-orb-2" />

            <div className="tt-admin-container">
                {/* Header */}
                <div className="tt-admin-header">
                    <div className="tt-admin-title-row">
                        <Shield size={28} className="tt-admin-icon" />
                        <div>
                            <h1 className="tt-admin-title">Tech Talk 2026 — Admin</h1>
                            <p className="tt-admin-subtitle">Registration Management Dashboard</p>
                        </div>
                    </div>
                    <div className="tt-admin-header-actions">
                        <button className="tt-admin-btn-outline" onClick={fetchAll} title="Refresh">
                            <RefreshCw size={15} /> Refresh
                        </button>
                        <button className="tt-admin-btn-outline" onClick={() => exportCSV(filteredRows)} title="Export CSV">
                            <Download size={15} /> Export CSV
                        </button>
                        <button
                            className={`tt-admin-toggle-btn ${settings?.isOpen ? "tt-open" : "tt-closed-btn"}`}
                            onClick={handleToggle}
                        >
                            {settings?.isOpen ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                            {settings?.isOpen ? "Registrations Open" : "Registrations Closed"}
                        </button>
                    </div>
                </div>

                {/* Stats cards */}
                {loading ? (
                    <div className="tt-admin-loading">Loading data…</div>
                ) : (
                    <>
                        <div className="tt-stats-grid">
                            <StatCard icon="👥" value={settings?.registeredCount ?? 0} label="Total Registered" color="blue" />
                            <StatCard icon="🪑" value={settings?.remainingSeats ?? 0} label="Seats Remaining" color={settings?.remainingSeats === 0 ? "red" : "green"} />
                            <StatCard icon="📊" value={`${settings?.maxCapacity ?? 50}`} label="Total Capacity" color="purple" />
                            <StatCard icon={settings?.isOpen ? "🟢" : "🔴"} value={settings?.isOpen ? "Open" : "Closed"} label="Status" color={settings?.isOpen ? "green" : "red"} />
                            <StatCard icon="📎" value={registrations.filter(r => r.pptFilePath).length} label="PPTs Uploaded" color="blue" />
                        </div>

                        {/* Capacity bar + extend */}
                        <div className="tt-admin-capacity-card">
                            <div className="tt-cap-labels">
                                <span>{pct}% of capacity used</span>
                                <button className="tt-extend-btn" onClick={() => setShowExtendModal(true)}>
                                    <Settings size={14} /> Extend Limit
                                </button>
                            </div>
                            <div className="tt-bar-bg">
                                <div
                                    className={`tt-bar-fill ${pct >= 90 ? "bg-red-500" : pct >= 70 ? "bg-amber-400" : "bg-emerald-400"}`}
                                    style={{ width: `${pct}%`, transition: "width 0.6s ease" }}
                                />
                            </div>
                            <div className="tt-cap-sub">
                                {settings?.registeredCount ?? 0} / {settings?.maxCapacity ?? 50} registered
                                {settings?.lastExtendedAt && (
                                    <span className="tt-last-extended">
                                        · Last extended by +{settings.lastExtensionAmount} on{" "}
                                        {new Date(settings.lastExtendedAt).toLocaleDateString()}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Search */}
                        <div className="tt-search-bar">
                            <Search size={16} className="tt-search-icon" />
                            <input
                                className="tt-search-input"
                                placeholder="Search by name, email, college or topic…"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <span className="tt-search-count">{filteredRows.length} result{filteredRows.length !== 1 ? "s" : ""}</span>
                        </div>

                        {/* Table */}
                        <div className="tt-table-wrapper">
                            {filteredRows.length === 0 ? (
                                <div className="tt-empty-state">
                                    <Users size={40} className="tt-empty-icon" />
                                    <p>{search ? "No results match your search." : "No registrations yet."}</p>
                                </div>
                            ) : (
                                <table className="tt-table">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <SortTh label="Name" k="fullName" onSort={handleSort} Icon={<SortIcon k="fullName" />} />
                                            <SortTh label="Email" k="email" onSort={handleSort} Icon={<SortIcon k="email" />} />
                                            <th>Phone</th>
                                            <SortTh label="College" k="college" onSort={handleSort} Icon={<SortIcon k="college" />} />
                                            <th>Year</th>
                                            <SortTh label="PPT Topic" k="pptTopic" onSort={handleSort} Icon={<SortIcon k="pptTopic" />} />
                                            <th>Referred By</th>
                                            <th>PPT File</th>
                                            <SortTh label="Registered At" k="registeredAt" onSort={handleSort} Icon={<SortIcon k="registeredAt" />} />
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredRows.map((r, i) => (
                                            <tr key={r.id} className="tt-table-row">
                                                <td className="tt-td-num">{i + 1}</td>
                                                <td className="tt-td-name">{r.fullName}</td>
                                                <td className="tt-td-email">{r.email}</td>
                                                <td>{r.phone}</td>
                                                <td>{r.college}</td>
                                                <td><span className="tt-year-badge">{r.yearOfStudy}</span></td>
                                                <td><span className="tt-topic-badge">{r.pptTopic}</span></td>
                                                <td className="tt-td-ref">{r.referredBy || "—"}</td>
                                                <td>
                                                    {r.pptFilePath
                                                        ? <a className="tt-ppt-link" href={`${API_BASE}${r.pptFilePath}`} target="_blank" rel="noopener noreferrer" title={r.pptOriginalName}>
                                                            <FileText size={12} /> {r.pptOriginalName?.slice(0, 22) || "View PPT"}
                                                        </a>
                                                        : <span className="tt-ppt-missing">Not uploaded</span>
                                                    }
                                                </td>
                                                <td className="tt-td-date">{new Date(r.registeredAt).toLocaleString()}</td>
                                                <td>
                                                    <button
                                                        className="tt-delete-btn"
                                                        onClick={() => handleDelete(r.id, r.fullName)}
                                                        disabled={deletingId === r.id}
                                                        title="Remove registration"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </>
                )}
            </div>

            {showExtendModal && (
                <ExtendModal onClose={() => setShowExtendModal(false)} onExtend={handleExtend} />
            )}
        </div>
    );
}

// ── Helper components ───────────────────────────────────────────────────────
function StatCard({ icon, value, label, color }) {
    const colors = {
        blue: "tt-stat-blue",
        green: "tt-stat-green",
        purple: "tt-stat-purple",
        red: "tt-stat-red",
    };
    return (
        <div className={`tt-stat-card ${colors[color] ?? ""}`}>
            <span className="tt-stat-icon">{icon}</span>
            <span className="tt-stat-value">{value}</span>
            <span className="tt-stat-label">{label}</span>
        </div>
    );
}

function SortTh({ label, k, onSort, Icon }) {
    return (
        <th className="tt-th-sortable" onClick={() => onSort(k)}>
            {label} {Icon}
        </th>
    );
}
