import { jsx as _jsx } from "react/jsx-runtime";
export default function Button({ children, onClick, variant = "secondary", disabled = false, fullWidth = false, style }) {
    const styles = {
        primary: {
            background: "#185FA5",
            color: "#fff",
            border: "none",
        },
        secondary: {
            background: "transparent",
            color: "#374151",
            border: "0.5px solid #d1d5db",
        },
        danger: {
            background: "#dc2626",
            color: "#fff",
            border: "none",
        }
    };
    return (_jsx("button", { onClick: onClick, disabled: disabled, style: {
            padding: "8px 16px",
            fontSize: "13px",
            fontWeight: 500,
            borderRadius: "8px",
            cursor: disabled ? "not-allowed" : "pointer",
            opacity: disabled ? 0.6 : 1,
            width: fullWidth ? "100%" : "auto",
            transition: "opacity 0.15s",
            ...styles[variant],
            ...style
        }, children: children }));
}
