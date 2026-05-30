import { jsx as _jsx } from "react/jsx-runtime";
import { MsalProvider } from "@azure/msal-react";
import { msalInstance } from "./msalConfig";
import { useEffect, useState } from "react";
export default function AuthProvider({ children }) {
    const [initialized, setInitialized] = useState(false);
    useEffect(() => {
        msalInstance.initialize()
            .then(() => msalInstance.handleRedirectPromise())
            .then(() => setInitialized(true))
            .catch(() => setInitialized(true));
    }, []);
    if (!initialized)
        return null;
    return (_jsx(MsalProvider, { instance: msalInstance, children: children }));
}
