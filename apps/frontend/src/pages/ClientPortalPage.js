import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { validateInvitationToken } from "../services/api";
import LoadingSpinner from "../components/common/LoadingSpinner";
import ClientAssessmentFlow from "./ClientAssessmentFlow";
import ClientReportPage from "./ClientReportPage";
import ClientErrorPage from "./ClientErrorPage";
export default function ClientPortalPage() {
    const { token } = useParams();
    const [state, setState] = useState("loading");
    const [invitation, setInvitation] = useState(null);
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
                    setState(response.data.status);
                }
                else {
                    setState("invalid");
                }
            }
            catch (err) {
                if (err?.response?.status === 410) {
                    setState("expired");
                }
                else {
                    setState("invalid");
                }
            }
        }
        checkToken();
    }, [token]);
    if (state === "loading")
        return _jsx(LoadingSpinner, { message: "Validating your link..." });
    if (state === "expired")
        return _jsx(ClientErrorPage, { type: "expired" });
    if (state === "invalid")
        return _jsx(ClientErrorPage, { type: "invalid" });
    if (state === "completed" && invitation?.assessmentId) {
        return _jsx(ClientReportPage, { assessmentId: invitation.assessmentId, token: token });
    }
    if (state === "pending" && invitation) {
        return (_jsx(ClientAssessmentFlow, { token: token, companyName: invitation.companyName, email: invitation.email, industry: invitation.industry }));
    }
    return _jsx(ClientErrorPage, { type: "invalid" });
}
