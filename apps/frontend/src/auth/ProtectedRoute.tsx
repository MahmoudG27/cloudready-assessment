import { useIsAuthenticated, useMsal } from "@azure/msal-react";
import { InteractionStatus } from "@azure/msal-browser";
import { loginRequest } from "./msalConfig";
import { ReactNode, useEffect } from "react";
import LoadingSpinner from "../components/common/LoadingSpinner";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const isAuthenticated = useIsAuthenticated();
  const { instance, inProgress } = useMsal();

  useEffect(() => {
    if (!isAuthenticated && inProgress === InteractionStatus.None) {
      instance.loginRedirect(loginRequest);
    }
  }, [isAuthenticated, inProgress, instance]);

  if (inProgress !== InteractionStatus.None) {
    return <LoadingSpinner message="Signing in..." />;
  }

  if (!isAuthenticated) {
    return <LoadingSpinner message="Redirecting to Microsoft login..." />;
  }

  return <>{children}</>;
}