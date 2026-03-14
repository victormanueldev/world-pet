/**
 * main.tsx — Application entry point.
 *
 * Wraps the App in StrictMode for additional runtime warnings,
 * BrowserRouter for client-side routing, AuthProvider for
 * authentication context, and TenantProvider for tenant state.
 */
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import App from "@/App";
import "./styles/globals.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <BrowserRouter>
            <AuthProvider>
                <App />
            </AuthProvider>
        </BrowserRouter>
    </React.StrictMode>
);
