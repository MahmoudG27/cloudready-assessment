import { MsalProvider } from "@azure/msal-react";
import { msalInstance } from "./msalConfig";
import { ReactNode, useEffect } from "react";

export default function AuthProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    msalInstance.initialize().then(() => {
      msalInstance.handleRedirectPromise();
    });
  }, []);

  return (
    <MsalProvider instance={msalInstance}>
      {children}
    </MsalProvider>
  );
}