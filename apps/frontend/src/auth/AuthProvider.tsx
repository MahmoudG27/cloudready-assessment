import { MsalProvider } from "@azure/msal-react";
import { msalInstance } from "./msalConfig";
import { ReactNode, useEffect, useState } from "react";

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    msalInstance.initialize()
      .then(() => msalInstance.handleRedirectPromise())
      .then(() => setInitialized(true))
      .catch(() => setInitialized(true));
  }, []);

  if (!initialized) return null;

  return (
    <MsalProvider instance={msalInstance}>
      {children}
    </MsalProvider>
  );
}