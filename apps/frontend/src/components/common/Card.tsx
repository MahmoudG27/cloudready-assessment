import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  style?: React.CSSProperties;
}

export default function Card({ children, style }: CardProps) {
  return (
    <div style={{
      background: "#ffffff",
      border: "0.5px solid #e5e7eb",
      borderRadius: "12px",
      padding: "20px 24px",
      marginBottom: "16px",
      ...style
    }}>
      {children}
    </div>
  );
}