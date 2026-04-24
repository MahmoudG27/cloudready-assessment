import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export default function LoadingSpinner({ message = "Loading..." }) {
    return (_jsxs("div", { style: {
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "48px",
            gap: "16px"
        }, children: [_jsx("div", { style: {
                    width: "40px",
                    height: "40px",
                    border: "3px solid #e5e7eb",
                    borderTop: "3px solid #185FA5",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite"
                } }), _jsx("p", { style: { color: "#6b7280", fontSize: "14px" }, children: message }), _jsx("style", { children: `@keyframes spin { to { transform: rotate(360deg); } }` })] }));
}
