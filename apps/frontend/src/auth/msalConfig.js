import { PublicClientApplication } from "@azure/msal-browser";
const msalConfig = {
    auth: {
        clientId: import.meta.env.VITE_ENTRA_CLIENT_ID,
        authority: `https://login.microsoftonline.com/${import.meta.env.VITE_ENTRA_TENANT_ID}`,
        redirectUri: window.location.origin,
    },
    cache: {
        cacheLocation: "sessionStorage",
    },
};
export const msalInstance = new PublicClientApplication(msalConfig);
export const loginRequest = {
    scopes: ["User.Read"],
};
