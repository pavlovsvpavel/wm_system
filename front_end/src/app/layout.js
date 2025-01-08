"use client";

import { Ubuntu } from "next/font/google";
import "../styles/globals.css";
import ToastContainer, { toastConfig } from "../utils/toastConfig";
import "react-toastify/dist/ReactToastify.css";
import Navigation from "./components/navigation";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { AuthProvider, useAuth } from '../app/context/AuthContext';

const ubuntu = Ubuntu({
    weight: ["300", "400", "500", "700"],
    subsets: ["latin", "cyrillic"],
    variable: "--font-ubuntu",
});

// export const metadata = {
//   title: "Warehouse management",
//   description: "",
// };

export default function RootLayout({ children }) {
    const pathname = usePathname();

    useEffect(() => {
        document.title = "Warehouse Management";
    }, []);

    // Define the routes where the Navigation should be visible
    const showNavigationRoutes = ["/upload", "/export", "/search", "/qr-scanner"];
    const hideNavigationRoutes = ["/", "/login", "/register"]; // Add routes where the Navbar should be hidden
    const shouldShowNavigation = showNavigationRoutes.includes(pathname) && !hideNavigationRoutes.includes(pathname);
    
    return (
        <html lang="en">
            <head>
                <link rel="icon" href="/images/favicon.ico" type="image/png" />
            </head>
            <body className={ubuntu.variable}>
                <AuthProvider>
                {shouldShowNavigation && <Navigation />}
                    {children}
                </AuthProvider>
                <ToastContainer {...toastConfig} />
            </body>
        </html>
    );
}
