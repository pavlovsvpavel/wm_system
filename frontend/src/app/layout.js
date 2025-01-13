"use client";

import { Ubuntu } from "next/font/google";
import "../styles/globals.css";
import ToastContainer, { toastConfig } from "../utils/toastConfig";
import "react-toastify/dist/ReactToastify.css";
import Navigation from "./components/navigation/navbar";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { AuthProvider, useAuth } from './context/AuthContext';
import { FileProvider } from "./context/FileContext";

const ubuntu = Ubuntu({
    weight: ["300", "400", "500", "700"],
    subsets: ["latin", "cyrillic"],
    variable: "--font-ubuntu",
});

export default function RootLayout({ children }) {
    const pathname = usePathname();

    useEffect(() => {
        document.title = "Warehouse Management";
    }, []);

    const showNavigationRoutes = ["/dashboard", "/upload", "/export", "/search", "/qr-scanner", "/user-options"];
    const hideNavigationRoutes = ["/", "/login", "/register"];
    const shouldShowNavigation = showNavigationRoutes.includes(pathname) && !hideNavigationRoutes.includes(pathname);

    const routesWithFileProvider = ["/search", "/qr-scanner"];
    const isFileProviderRoute = routesWithFileProvider.some((route) =>
        typeof window !== "undefined" && window.location.pathname.startsWith(route)
    );

    return (
        <html lang="en">
            <head>
                <link rel="icon" href="/images/favicon.ico" type="image/png" />
            </head>
            <body className={ubuntu.variable}>
                <AuthProvider>
                    <FileProvider>
                        {shouldShowNavigation && <Navigation />}
                        {children}
                    </FileProvider>
                </AuthProvider>

                <ToastContainer {...toastConfig} />
            </body>
        </html>
    );
}
