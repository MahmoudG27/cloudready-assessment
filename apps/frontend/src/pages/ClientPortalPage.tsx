import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { validateInvitationToken } from "../services/api";
import LoadingSpinner from "../components/common/LoadingSpinner";
import ClientAssessmentFlow from "./ClientAssessmentFlow";
import ClientReportPage from "./ClientReportPage";
import ClientErrorPage from "./ClientErrorPage";

type PortalState = "loading" | "pending" | "completed" | "expired" | "invalid";

interface InvitationData {
  status: string;
  companyName: string;
  email: string;
  industry: string | null;
  expiresAt: string;
  assessmentId: string | null;
}

export default function ClientPortalPage() {
  const { token } = useParams<{ token: string }>();
  const [state, setState] = useState<PortalState>("loading");
  const [invitation, setInvitation] = useState<InvitationData | null>(null);

  useEffect(() => {
    async function checkToken() {
      if (!token) {
        setState("invalid");
        return;
      }

      try {
        const response = await validateInvitationToken(token);

        if (response.success && response.data) {
          setInvitation(response.data);
          setState(response.data.status as PortalState);
        } else {
          setState("invalid");
        }
      } catch (err: any) {
        if (err?.response?.status === 410) {
          setState("expired");
        } else {
          setState("invalid");
        }
      }
    }

    checkToken();
  }, [token]);

  if (state === "loading") return <LoadingSpinner message="Validating your link..." />;
  if (state === "expired") return <ClientErrorPage type="expired" />;
  if (state === "invalid") return <ClientErrorPage type="invalid" />;
  if (state === "completed" && invitation?.assessmentId) {
    return <ClientReportPage assessmentId={invitation.assessmentId} token={token!} />;
  }
  if (state === "pending" && invitation) {
    return (
      <ClientAssessmentFlow
        token={token!}
        companyName={invitation.companyName}
        email={invitation.email}
        industry={invitation.industry}
      />
    );
  }

  return <ClientErrorPage type="invalid" />;
}