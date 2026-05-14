import { jsx as _jsx } from "react/jsx-runtime";
import { MsalProvider } from "@azure/msal-react";
import { msalInstance } from "./msalConfig";
import { useEffect } from "react";
export default function AuthProvider({ children }) {
    useEffect(() => {
        msalInstance.initialize().then(() => {
            msalInstance.handleRedirectPromise();
        });
    }, []);
    return (_jsx(MsalProvider, { instance: msalInstance, children: children }));
}
