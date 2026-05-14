import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { useIsAuthenticated, useMsal } from "@azure/msal-react";
import { loginRequest } from "./msalConfig";
import { useEffect } from "react";
import LoadingSpinner from "../components/common/LoadingSpinner";
export default function ProtectedRoute({ children }) {
    const isAuthenticated = useIsAuthenticated();
    const { instance, inProgress } = useMsal();
    useEffect(() => {
        if (!isAuthenticated && inProgress === "none") {
            instance.loginRedirect(loginRequest);
        }
    }, [isAuthenticated, inProgress, instance]);
    if (!isAuthenticated) {
        return _jsx(LoadingSpinner, { message: "Redirecting to Microsoft login..." });
    }
    return _jsx(_Fragment, { children: children });
}
