import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createInvitation, getInvitations } from "../services/api";
import Button from "../components/common/Button";
import Card from "../components/common/Card";

interface Invitation {
  id: string;
  token: string;
  email: string;
  companyName: string;
  industry?: string;
  notes?: string;
  status: "pending" | "completed" | "expired";
  assessmentId: string | null;
  createdBy: string;
  createdAt: string;
  expiresAt: string;
  completedAt: string | null;
}

export default function InvitationsPage() {
  const navigate = useNavigate();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [form, setForm] = useState({
    email: "",
    companyName: "",
    industry: "",
    notes: "",
  });
  const [newLink, setNewLink] = useState<string | null>(null);

  const FRONTEND_URL = import.meta.env.VITE_APP_URL || window.location.origin;

  useEffect(() => {
    fetchInvitations();
  }, []);

  async function fetchInvitations() {
    try {
      const response = await getInvitations();
      if (response.success && response.data) {
        setInvitations(response.data as Invitation[]);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    if (!form.email || !form.companyName) return;
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
    } finally {
      setCreating(false);
    }
  }

  function copyLink(token: string) {
    const link = `${FRONTEND_URL}/a/${token}`;
    navigator.clipboard.writeText(link);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  }

  function getStatusBadge(status: string) {
    const styles: Record<string, React.CSSProperties> = {
      pending: { background: "#E6F1FB", color: "#0C447C" },
      completed: { background: "#EAF3DE", color: "#27500A" },
      expired: { background: "#f3f4f6", color: "#6b7280" },
    };
    return (
      <span style={{
        ...styles[status] ?? styles.pending,
        padding: "3px 10px", borderRadius: "20px",
        fontSize: "11px", fontWeight: 500
      }}>
        {status}
      </span>
    );
  }

  function getDaysLeft(expiresAt: string): string {
    const diff = new Date(expiresAt).getTime() - Date.now();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days <= 0) return "Expired";
    if (days === 1) return "1 day left";
    return `${days} days left`;
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb" }}>
      {/* Topbar */}
      <div style={{
        background: "#fff", borderBottom: "0.5px solid #e5e7eb",
        padding: "12px 24px", display: "flex",
        alignItems: "center", justifyContent: "space-between"
      }}>
        <span style={{ fontSize: "15px", fontWeight: 500 }}>
          Klayytech <span style={{ color: "#185FA5" }}>CloudReady</span>
        </span>
        <div style={{ display: "flex", gap: "8px" }}>
          <Button onClick={() => navigate("/dashboard")}>Dashboard</Button>
          <Button variant="primary" onClick={() => { setShowModal(true); setNewLink(null); }}>
            + Create Invitation
          </Button>
        </div>
      </div>

      <div style={{ padding: "24px", maxWidth: "1000px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "20px" }}>
          <div style={{ fontSize: "18px", fontWeight: 500, marginBottom: "4px" }}>
            Assessment Invitations
          </div>
          <div style={{ fontSize: "13px", color: "#6b7280" }}>
            Create and manage client assessment links
          </div>
        </div>

        {/* Metrics */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
          gap: "12px", marginBottom: "20px"
        }}>
          {[
            { label: "Total sent", value: invitations.length, color: "#374151" },
            { label: "Completed", value: invitations.filter(i => i.status === "completed").length, color: "#27500A" },
            { label: "Pending", value: invitations.filter(i => i.status === "pending").length, color: "#0C447C" },
          ].map((m) => (
            <div key={m.label} style={{
              background: "#f3f4f6", borderRadius: "8px", padding: "14px 16px"
            }}>
              <div style={{ fontSize: "11px", color: "#6b7280", marginBottom: "6px" }}>{m.label}</div>
              <div style={{ fontSize: "22px", fontWeight: 500, color: m.color }}>{m.value}</div>
            </div>
          ))}
        </div>

        {/* Table */}
        <Card>
          <div style={{ fontSize: "14px", fontWeight: 500, marginBottom: "16px" }}>
            All Invitations
          </div>

          {loading ? (
            <div style={{ padding: "24px", textAlign: "center", color: "#6b7280", fontSize: "13px" }}>
              Loading...
            </div>
          ) : invitations.length === 0 ? (
            <div style={{ padding: "48px", textAlign: "center", color: "#6b7280" }}>
              <div style={{ fontSize: "16px", fontWeight: 500, marginBottom: "8px" }}>
                No invitations yet
              </div>
              <div style={{ fontSize: "13px", marginBottom: "20px" }}>
                Create your first client invitation
              </div>
              <Button variant="primary" onClick={() => setShowModal(true)}>
                + Create Invitation
              </Button>
            </div>
          ) : (
            <div>
              {/* Table Header */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "2fr 1.5fr 1fr 1fr 1fr 1fr",
                padding: "8px 12px",
                background: "#f9fafb", borderRadius: "8px", marginBottom: "4px"
              }}>
                {["Company", "Email", "Industry", "Status", "Expires", "Actions"].map(h => (
                  <span key={h} style={{ fontSize: "11px", color: "#6b7280", fontWeight: 500 }}>
                    {h}
                  </span>
                ))}
              </div>

              {/* Rows */}
              {invitations.map((inv) => (
                <div key={inv.id} style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 1.5fr 1fr 1fr 1fr 1fr",
                  padding: "12px", borderBottom: "0.5px solid #e5e7eb",
                  alignItems: "center"
                }}>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: 500 }}>{inv.companyName}</div>
                    <div style={{ fontSize: "11px", color: "#6b7280" }}>
                      {new Date(inv.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <span style={{ fontSize: "12px", color: "#6b7280" }}>{inv.email}</span>
                  <span style={{ fontSize: "12px", color: "#6b7280" }}>{inv.industry ?? "—"}</span>
                  <span>{getStatusBadge(inv.status)}</span>
                  <span style={{
                    fontSize: "11px",
                    color: inv.status === "expired" ? "#9ca3af" :
                      getDaysLeft(inv.expiresAt) === "1 day left" ? "#E24B4A" : "#6b7280"
                  }}>
                    {inv.status === "completed" ? "—" : getDaysLeft(inv.expiresAt)}
                  </span>
                  <div style={{ display: "flex", gap: "6px" }}>
                    {inv.status === "pending" && (
                      <Button onClick={() => copyLink(inv.token)}>
                        {copiedToken === inv.token ? "Copied!" : "Copy link"}
                      </Button>
                    )}
                    {inv.status === "completed" && inv.assessmentId && (
                      <Button onClick={() => navigate(`/report/${inv.assessmentId}`)}>
                        View report
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Create Invitation Modal */}
      {showModal && (
        <div style={{
          position: "fixed", top: 0, left: 0,
          width: "100vw", height: "100vh",
          background: "rgba(0,0,0,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 9999
        }}>
          <div style={{
            width: "460px", background: "#fff",
            borderRadius: "12px", padding: "24px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.2)"
          }}>
            {!newLink ? (
              <>
                <div style={{ fontSize: "15px", fontWeight: 600, marginBottom: "16px" }}>
                  Create Assessment Invitation
                </div>

                {/* Email */}
                <div style={{ marginBottom: "12px" }}>
                  <label style={{ fontSize: "12px", fontWeight: 500, display: "block", marginBottom: "6px", color: "#374151" }}>
                    Client email *
                  </label>
                  <input
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="client@company.com"
                    style={{
                      width: "100%", padding: "9px 12px",
                      border: "0.5px solid #d1d5db", borderRadius: "8px",
                      fontSize: "13px", boxSizing: "border-box"
                    }}
                  />
                </div>

                {/* Company Name */}
                <div style={{ marginBottom: "12px" }}>
                  <label style={{ fontSize: "12px", fontWeight: 500, display: "block", marginBottom: "6px", color: "#374151" }}>
                    Company name *
                  </label>
                  <input
                    value={form.companyName}
                    onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                    placeholder="e.g. MedCare Egypt"
                    style={{
                      width: "100%", padding: "9px 12px",
                      border: "0.5px solid #d1d5db", borderRadius: "8px",
                      fontSize: "13px", boxSizing: "border-box"
                    }}
                  />
                </div>

                {/* Industry */}
                <div style={{ marginBottom: "12px" }}>
                  <label style={{ fontSize: "12px", fontWeight: 500, display: "block", marginBottom: "6px", color: "#374151" }}>
                    Industry (optional)
                  </label>
                  <select
                    value={form.industry}
                    onChange={(e) => setForm({ ...form, industry: e.target.value })}
                    style={{
                      width: "100%", padding: "9px 12px",
                      border: "0.5px solid #d1d5db", borderRadius: "8px",
                      fontSize: "13px", background: "#fff", boxSizing: "border-box"
                    }}
                  >
                    <option value="">Select industry</option>
                    {["Healthcare", "Fintech", "Retail", "SaaS", "Manufacturing", "Other"].map(i => (
                      <option key={i} value={i}>{i}</option>
                    ))}
                  </select>
                </div>

                {/* Notes */}
                <div style={{ marginBottom: "20px" }}>
                  <label style={{ fontSize: "12px", fontWeight: 500, display: "block", marginBottom: "6px", color: "#374151" }}>
                    Notes (optional)
                  </label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    placeholder="e.g. Met at Tech Conference Cairo 2025"
                    rows={2}
                    style={{
                      width: "100%", padding: "9px 12px",
                      border: "0.5px solid #d1d5db", borderRadius: "8px",
                      fontSize: "13px", resize: "none", boxSizing: "border-box"
                    }}
                  />
                </div>

                <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                  <Button onClick={() => setShowModal(false)}>Cancel</Button>
                  <Button
                    variant="primary"
                    onClick={handleCreate}
                    disabled={creating || !form.email || !form.companyName}
                  >
                    {creating ? "Creating..." : "Create invitation"}
                  </Button>
                </div>
              </>
            ) : (
              // Success state — show link
              <>
                <div style={{ textAlign: "center", marginBottom: "16px" }}>
                  <div style={{
                    width: "48px", height: "48px", borderRadius: "50%",
                    background: "#EAF3DE", margin: "0 auto 12px",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "20px"
                  }}>✓</div>
                  <div style={{ fontSize: "15px", fontWeight: 600, marginBottom: "4px" }}>
                    Invitation created!
                  </div>
                  <div style={{ fontSize: "13px", color: "#6b7280" }}>
                    Share this link with your client
                  </div>
                </div>

                <div style={{
                  background: "#f9fafb", border: "0.5px solid #e5e7eb",
                  borderRadius: "8px", padding: "12px",
                  fontSize: "12px", color: "#374151",
                  wordBreak: "break-all", marginBottom: "16px"
                }}>
                  {newLink}
                </div>

                <div style={{ display: "flex", gap: "8px" }}>
                  <Button
                    fullWidth
                    onClick={() => {
                      navigator.clipboard.writeText(newLink);
                      setCopiedToken("new");
                      setTimeout(() => setCopiedToken(null), 2000);
                    }}
                  >
                    {copiedToken === "new" ? "Copied!" : "Copy link"}
                  </Button>
                  <Button
                    variant="primary"
                    fullWidth
                    onClick={() => {
                      setShowModal(false);
                      setNewLink(null);
                    }}
                  >
                    Done
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}