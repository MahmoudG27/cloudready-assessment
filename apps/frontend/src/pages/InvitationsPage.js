import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createInvitation, getInvitations } from "../services/api";
import Button from "../components/common/Button";
import Card from "../components/common/Card";
export default function InvitationsPage() {
    const navigate = useNavigate();
    const [invitations, setInvitations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [creating, setCreating] = useState(false);
    const [copiedToken, setCopiedToken] = useState(null);
    const [form, setForm] = useState({
        email: "",
        companyName: "",
        industry: "",
        notes: "",
    });
    const [newLink, setNewLink] = useState(null);
    const FRONTEND_URL = import.meta.env.VITE_APP_URL || window.location.origin;
    useEffect(() => {
        fetchInvitations();
    }, []);
    async function fetchInvitations() {
        try {
            const response = await getInvitations();
            if (response.success && response.data) {
                setInvitations(response.data);
            }
        }
        finally {
            setLoading(false);
        }
    }
    async function handleCreate() {
        if (!form.email || !form.companyName)
            return;
        setCreating(true);
        try {
            const response = await createInvitation({
                email: form.email,
                companyName: form.companyName,
                industry: form.industry || undefined,
                notes: form.notes || undefined,
                createdBy: "sales@klayytech.com", // TODO: replace with Entra ID user
            });
            if (response.success && response.data) {
                const link = `${FRONTEND_URL}/a/${response.data.token}`;
                setNewLink(link);
                setForm({ email: "", companyName: "", industry: "", notes: "" });
                await fetchInvitations();
            }
        }
        finally {
            setCreating(false);
        }
    }
    function copyLink(token) {
        const link = `${FRONTEND_URL}/a/${token}`;
        navigator.clipboard.writeText(link);
        setCopiedToken(token);
        setTimeout(() => setCopiedToken(null), 2000);
    }
    function getStatusBadge(status) {
        const styles = {
            pending: { background: "#E6F1FB", color: "#0C447C" },
            completed: { background: "#EAF3DE", color: "#27500A" },
            expired: { background: "#f3f4f6", color: "#6b7280" },
        };
        return (_jsx("span", { style: {
                ...styles[status] ?? styles.pending,
                padding: "3px 10px", borderRadius: "20px",
                fontSize: "11px", fontWeight: 500
            }, children: status }));
    }
    function getDaysLeft(expiresAt) {
        const diff = new Date(expiresAt).getTime() - Date.now();
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        if (days <= 0)
            return "Expired";
        if (days === 1)
            return "1 day left";
        return `${days} days left`;
    }
    return (_jsxs("div", { style: { minHeight: "100vh", background: "#f9fafb" }, children: [_jsxs("div", { style: {
                    background: "#fff", borderBottom: "0.5px solid #e5e7eb",
                    padding: "12px 24px", display: "flex",
                    alignItems: "center", justifyContent: "space-between"
                }, children: [_jsxs("span", { style: { fontSize: "15px", fontWeight: 500 }, children: ["Klayytech ", _jsx("span", { style: { color: "#185FA5" }, children: "CloudReady" })] }), _jsxs("div", { style: { display: "flex", gap: "8px" }, children: [_jsx(Button, { onClick: () => navigate("/dashboard"), children: "Dashboard" }), _jsx(Button, { variant: "primary", onClick: () => { setShowModal(true); setNewLink(null); }, children: "+ Create Invitation" })] })] }), _jsxs("div", { style: { padding: "24px", maxWidth: "1000px", margin: "0 auto" }, children: [_jsxs("div", { style: { marginBottom: "20px" }, children: [_jsx("div", { style: { fontSize: "18px", fontWeight: 500, marginBottom: "4px" }, children: "Assessment Invitations" }), _jsx("div", { style: { fontSize: "13px", color: "#6b7280" }, children: "Create and manage client assessment links" })] }), _jsx("div", { style: {
                            display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
                            gap: "12px", marginBottom: "20px"
                        }, children: [
                            { label: "Total sent", value: invitations.length, color: "#374151" },
                            { label: "Completed", value: invitations.filter(i => i.status === "completed").length, color: "#27500A" },
                            { label: "Pending", value: invitations.filter(i => i.status === "pending").length, color: "#0C447C" },
                        ].map((m) => (_jsxs("div", { style: {
                                background: "#f3f4f6", borderRadius: "8px", padding: "14px 16px"
                            }, children: [_jsx("div", { style: { fontSize: "11px", color: "#6b7280", marginBottom: "6px" }, children: m.label }), _jsx("div", { style: { fontSize: "22px", fontWeight: 500, color: m.color }, children: m.value })] }, m.label))) }), _jsxs(Card, { children: [_jsx("div", { style: { fontSize: "14px", fontWeight: 500, marginBottom: "16px" }, children: "All Invitations" }), loading ? (_jsx("div", { style: { padding: "24px", textAlign: "center", color: "#6b7280", fontSize: "13px" }, children: "Loading..." })) : invitations.length === 0 ? (_jsxs("div", { style: { padding: "48px", textAlign: "center", color: "#6b7280" }, children: [_jsx("div", { style: { fontSize: "16px", fontWeight: 500, marginBottom: "8px" }, children: "No invitations yet" }), _jsx("div", { style: { fontSize: "13px", marginBottom: "20px" }, children: "Create your first client invitation" }), _jsx(Button, { variant: "primary", onClick: () => setShowModal(true), children: "+ Create Invitation" })] })) : (_jsxs("div", { children: [_jsx("div", { style: {
                                            display: "grid",
                                            gridTemplateColumns: "2fr 1.5fr 1fr 1fr 1fr 1fr",
                                            padding: "8px 12px",
                                            background: "#f9fafb", borderRadius: "8px", marginBottom: "4px"
                                        }, children: ["Company", "Email", "Industry", "Status", "Expires", "Actions"].map(h => (_jsx("span", { style: { fontSize: "11px", color: "#6b7280", fontWeight: 500 }, children: h }, h))) }), invitations.map((inv) => (_jsxs("div", { style: {
                                            display: "grid",
                                            gridTemplateColumns: "2fr 1.5fr 1fr 1fr 1fr 1fr",
                                            padding: "12px", borderBottom: "0.5px solid #e5e7eb",
                                            alignItems: "center"
                                        }, children: [_jsxs("div", { children: [_jsx("div", { style: { fontSize: "13px", fontWeight: 500 }, children: inv.companyName }), _jsx("div", { style: { fontSize: "11px", color: "#6b7280" }, children: new Date(inv.createdAt).toLocaleDateString() })] }), _jsx("span", { style: { fontSize: "12px", color: "#6b7280" }, children: inv.email }), _jsx("span", { style: { fontSize: "12px", color: "#6b7280" }, children: inv.industry ?? "—" }), _jsx("span", { children: getStatusBadge(inv.status) }), _jsx("span", { style: {
                                                    fontSize: "11px",
                                                    color: inv.status === "expired" ? "#9ca3af" :
                                                        getDaysLeft(inv.expiresAt) === "1 day left" ? "#E24B4A" : "#6b7280"
                                                }, children: inv.status === "completed" ? "—" : getDaysLeft(inv.expiresAt) }), _jsxs("div", { style: { display: "flex", gap: "6px" }, children: [inv.status === "pending" && (_jsx(Button, { onClick: () => copyLink(inv.token), children: copiedToken === inv.token ? "Copied!" : "Copy link" })), inv.status === "completed" && inv.assessmentId && (_jsx(Button, { onClick: () => navigate(`/report/${inv.assessmentId}`), children: "View report" }))] })] }, inv.id)))] }))] })] }), showModal && (_jsx("div", { style: {
                    position: "fixed", top: 0, left: 0,
                    width: "100vw", height: "100vh",
                    background: "rgba(0,0,0,0.4)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    zIndex: 9999
                }, children: _jsx("div", { style: {
                        width: "460px", background: "#fff",
                        borderRadius: "12px", padding: "24px",
                        boxShadow: "0 20px 60px rgba(0,0,0,0.2)"
                    }, children: !newLink ? (_jsxs(_Fragment, { children: [_jsx("div", { style: { fontSize: "15px", fontWeight: 600, marginBottom: "16px" }, children: "Create Assessment Invitation" }), _jsxs("div", { style: { marginBottom: "12px" }, children: [_jsx("label", { style: { fontSize: "12px", fontWeight: 500, display: "block", marginBottom: "6px", color: "#374151" }, children: "Client email *" }), _jsx("input", { value: form.email, onChange: (e) => setForm({ ...form, email: e.target.value }), placeholder: "client@company.com", style: {
                                            width: "100%", padding: "9px 12px",
                                            border: "0.5px solid #d1d5db", borderRadius: "8px",
                                            fontSize: "13px", boxSizing: "border-box"
                                        } })] }), _jsxs("div", { style: { marginBottom: "12px" }, children: [_jsx("label", { style: { fontSize: "12px", fontWeight: 500, display: "block", marginBottom: "6px", color: "#374151" }, children: "Company name *" }), _jsx("input", { value: form.companyName, onChange: (e) => setForm({ ...form, companyName: e.target.value }), placeholder: "e.g. MedCare Egypt", style: {
                                            width: "100%", padding: "9px 12px",
                                            border: "0.5px solid #d1d5db", borderRadius: "8px",
                                            fontSize: "13px", boxSizing: "border-box"
                                        } })] }), _jsxs("div", { style: { marginBottom: "12px" }, children: [_jsx("label", { style: { fontSize: "12px", fontWeight: 500, display: "block", marginBottom: "6px", color: "#374151" }, children: "Industry (optional)" }), _jsxs("select", { value: form.industry, onChange: (e) => setForm({ ...form, industry: e.target.value }), style: {
                                            width: "100%", padding: "9px 12px",
                                            border: "0.5px solid #d1d5db", borderRadius: "8px",
                                            fontSize: "13px", background: "#fff", boxSizing: "border-box"
                                        }, children: [_jsx("option", { value: "", children: "Select industry" }), ["Healthcare", "Fintech", "Retail", "SaaS", "Manufacturing", "Other"].map(i => (_jsx("option", { value: i, children: i }, i)))] })] }), _jsxs("div", { style: { marginBottom: "20px" }, children: [_jsx("label", { style: { fontSize: "12px", fontWeight: 500, display: "block", marginBottom: "6px", color: "#374151" }, children: "Notes (optional)" }), _jsx("textarea", { value: form.notes, onChange: (e) => setForm({ ...form, notes: e.target.value }), placeholder: "e.g. Met at Tech Conference Cairo 2025", rows: 2, style: {
                                            width: "100%", padding: "9px 12px",
                                            border: "0.5px solid #d1d5db", borderRadius: "8px",
                                            fontSize: "13px", resize: "none", boxSizing: "border-box"
                                        } })] }), _jsxs("div", { style: { display: "flex", gap: "8px", justifyContent: "flex-end" }, children: [_jsx(Button, { onClick: () => setShowModal(false), children: "Cancel" }), _jsx(Button, { variant: "primary", onClick: handleCreate, disabled: creating || !form.email || !form.companyName, children: creating ? "Creating..." : "Create invitation" })] })] })) : (_jsxs(_Fragment, { children: [_jsxs("div", { style: { textAlign: "center", marginBottom: "16px" }, children: [_jsx("div", { style: {
                                            width: "48px", height: "48px", borderRadius: "50%",
                                            background: "#EAF3DE", margin: "0 auto 12px",
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            fontSize: "20px"
                                        }, children: "\u2713" }), _jsx("div", { style: { fontSize: "15px", fontWeight: 600, marginBottom: "4px" }, children: "Invitation created!" }), _jsx("div", { style: { fontSize: "13px", color: "#6b7280" }, children: "Share this link with your client" })] }), _jsx("div", { style: {
                                    background: "#f9fafb", border: "0.5px solid #e5e7eb",
                                    borderRadius: "8px", padding: "12px",
                                    fontSize: "12px", color: "#374151",
                                    wordBreak: "break-all", marginBottom: "16px"
                                }, children: newLink }), _jsxs("div", { style: { display: "flex", gap: "8px" }, children: [_jsx(Button, { fullWidth: true, onClick: () => {
                                            navigator.clipboard.writeText(newLink);
                                            setCopiedToken("new");
                                            setTimeout(() => setCopiedToken(null), 2000);
                                        }, children: copiedToken === "new" ? "Copied!" : "Copy link" }), _jsx(Button, { variant: "primary", fullWidth: true, onClick: () => {
                                            setShowModal(false);
                                            setNewLink(null);
                                        }, children: "Done" })] })] })) }) }))] }));
}
