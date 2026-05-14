import { useIsAuthenticated, useMsal } from "@azure/msal-react";
import { loginRequest } from "./msalConfig";
import { ReactNode, useEffect } from "react";
import LoadingSpinner from "../components/common/LoadingSpinner";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const isAuthenticated = useIsAuthenticated();
  const { instance, inProgress } = useMsal();

  useEffect(() => {
    if (!isAuthenticated && inProgress === "none") {
      instance.loginRedirect(loginRequest);
    }
  }, [isAuthenticated, inProgress, instance]);

  if (!isAuthenticated) {
    return <LoadingSpinner message="Redirecting to Microsoft login..." />;
  }

  return <>{children}</>;
}