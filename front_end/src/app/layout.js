'use client';

import {Ubuntu} from "next/font/google";
import "../styles/globals.css";
import ToastContainer, {toastConfig} from '../utils/toastConfig';
import 'react-toastify/dist/ReactToastify.css';
import Navigation from "./components/navigation";
import {usePathname} from "next/navigation";
import {useEffect} from "react";

const ubuntu = Ubuntu({
    weight: ['300', '400', '500', '700'],
    subsets: ["latin", "cyrillic"],
    variable: '--font-ubuntu',
});

// export const metadata = {
//   title: "Warehouse management",
//   description: "",
// };

export default function RootLayout({children}) {
    const pathname = usePathname();

    // Set the website title dynamically
    useEffect(() => {
        document.title = "Warehouse Management";
    }, []);

    // Define the routes where the Navigation should be visible
    const showNavigation = ['/dashboard', '/upload', '/export', '/search'].includes(pathname);
    return (
        <html lang="en">
        <head>
            {/* Add the favicon link here */}
            <link rel="icon" href="/images/favicon.ico" type="image/png"/>
        </head>
        <body className={ubuntu.variable}>
        {showNavigation && <Navigation/>}
        {children}

        <ToastContainer {...toastConfig} />
        </body>
        </html>
    );
}