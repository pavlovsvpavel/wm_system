"use client";

import Script from 'next/script';
import { Ubuntu } from "next/font/google";
import "../styles/globals.css";
import ToastContainer, { toastConfig } from "../utils/toastConfig";
import "react-toastify/dist/ReactToastify.css";
import Navigation from "./components/navigation";
import { usePathname } from "next/navigation";
import { AuthProvider } from './context/AuthContext';
import { FileProvider } from "./context/FileContext";
import Footer from "./components/footer";

const ubuntu = Ubuntu({
    weight: ["300", "400", "500", "700"],
    subsets: ["latin", "cyrillic"],
    variable: "--font-ubuntu",
});

export default function RootLayout({ children }) {
    const pathname = usePathname();;

    const showNavigationRoutes = ["/dashboard", "/upload", "/export", "/search", "/qr-scanner", "/user-options", "/routing"];
    const hideNavigationRoutes = ["/", "/login", "/register"];
    const shouldShowNavigation = showNavigationRoutes.includes(pathname) && !hideNavigationRoutes.includes(pathname);

    const routesWithFileProvider = ["/search", "/qr-scanner"];
    const isFileProviderRoute = routesWithFileProvider.some((route) =>
        typeof window !== "undefined" && window.location.pathname.startsWith(route)
    );

    return (
        <html lang="en">
            <head>
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
                />
                <link rel="icon" href="/images/favicon.ico" type="image/x-icon" />
                <title>Inventory Management</title>
                <Script
                    src={`https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`}
                    strategy="afterInteractive"
                />
            </head>
            <body className={ubuntu.variable}>
                <AuthProvider>
                    <FileProvider>
                        {shouldShowNavigation && <Navigation />}
                        {children}
                        <Footer />
                    </FileProvider>
                </AuthProvider>
                <ToastContainer {...toastConfig} />
            </body>
        </html>
    );
}
