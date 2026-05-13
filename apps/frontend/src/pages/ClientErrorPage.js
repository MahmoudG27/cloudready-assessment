import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export default function ClientErrorPage({ type }) {
    const content = {
        expired: {
            title: "This link has expired",
            message: "Your assessment link is no longer valid. Please contact your KlayyTech representative to receive a new link.",
            icon: "⏱",
        },
        invalid: {
            title: "Invalid link",
            message: "This assessment link is not valid. Please check the link in your email or contact your KlayyTech representative.",
            icon: "🔗",
        },
    };
    const { title, message, icon } = content[type];
    return (_jsx("div", { style: {
            minHeight: "100vh", background: "#f9fafb",
            display: "flex", alignItems: "center", justifyContent: "center"
        }, children: _jsxs("div", { style: {
                background: "#fff", border: "0.5px solid #e5e7eb",
                borderRadius: "12px", padding: "48px 40px",
                maxWidth: "460px", width: "100%", textAlign: "center"
            }, children: [_jsx("div", { style: { fontSize: "40px", marginBottom: "16px" }, children: icon }), _jsx("div", { style: { fontSize: "18px", fontWeight: 600, marginBottom: "8px", color: "#111827" }, children: title }), _jsx("div", { style: { fontSize: "14px", color: "#6b7280", lineHeight: 1.6, marginBottom: "24px" }, children: message }), _jsxs("div", { style: {
                        padding: "12px 16px", background: "#f9fafb",
                        borderRadius: "8px", fontSize: "12px", color: "#6b7280"
                    }, children: ["Need help? Contact us at", " ", _jsx("a", { href: "mailto:info@klayytech.com", style: { color: "#185FA5" }, children: "info@klayytech.com" })] })] }) }));
}
