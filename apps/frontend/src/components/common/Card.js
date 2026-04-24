import { jsx as _jsx } from "react/jsx-runtime";
export default function Card({ children, style }) {
    return (_jsx("div", { style: {
            background: "#ffffff",
            border: "0.5px solid #e5e7eb",
            borderRadius: "12px",
            padding: "20px 24px",
            marginBottom: "16px",
            ...style
        }, children: children }));
}
