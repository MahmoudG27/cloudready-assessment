import { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "danger";
  disabled?: boolean;
  fullWidth?: boolean;
  style?: React.CSSProperties;
}

export default function Button({
  children,
  onClick,
  variant = "secondary",
  disabled = false,
  fullWidth = false,
  style
}: ButtonProps) {
  const styles: Record<string, React.CSSProperties> = {
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

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
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
      }}
    >
      {children}
    </button>
  );
}