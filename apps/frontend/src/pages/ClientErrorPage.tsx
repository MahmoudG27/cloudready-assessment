interface ClientErrorPageProps {
  type: "expired" | "invalid";
}

export default function ClientErrorPage({ type }: ClientErrorPageProps) {
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

  return (
    <div style={{
      minHeight: "100vh", background: "#f9fafb",
      display: "flex", alignItems: "center", justifyContent: "center"
    }}>
      <div style={{
        background: "#fff", border: "0.5px solid #e5e7eb",
        borderRadius: "12px", padding: "48px 40px",
        maxWidth: "460px", width: "100%", textAlign: "center"
      }}>
        <div style={{ fontSize: "40px", marginBottom: "16px" }}>{icon}</div>
        <div style={{ fontSize: "18px", fontWeight: 600, marginBottom: "8px", color: "#111827" }}>
          {title}
        </div>
        <div style={{ fontSize: "14px", color: "#6b7280", lineHeight: 1.6, marginBottom: "24px" }}>
          {message}
        </div>
        <div style={{
          padding: "12px 16px", background: "#f9fafb",
          borderRadius: "8px", fontSize: "12px", color: "#6b7280"
        }}>
          Need help? Contact us at{" "}
          <a href="mailto:info@klayytech.com" style={{ color: "#185FA5" }}>
            info@klayytech.com
          </a>
        </div>
      </div>
    </div>
  );
}