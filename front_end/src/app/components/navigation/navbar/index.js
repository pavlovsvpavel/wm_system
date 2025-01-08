'use client';

import { usePathname } from "next/navigation";
import Link from "next/link";
import "../../../../styles/globals.css"
import Logo from "./Logo";
import { useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";


const Navbar = () => {
    const { isAuthenticated, logout } = useAuth();
    const pathname = usePathname(); // Get the current route

    // Define the routes where the Navigation bar should be visible
    const showNavigationRoutes = ["/upload", "/export", "/search", "/qr-scanner"];
    const shouldShowNavigation = showNavigationRoutes.includes(pathname);

    // // Early return if the Navbar should not be shown
    // if (!isAuthenticated || !shouldShowNavigation) {
    //     return null;
    // }

    // // const closeSidebar = () => {
    // //     const sidebarCheckbox = document.getElementById("sidebar-active");
    // //     if (sidebarCheckbox) {
    // //         sidebarCheckbox.checked = false;
    // //     }
    // // };

    // // Add event listeners to all sidebar links to close the sidebar when clicked
    // useEffect(() => {
    //     const closeSidebar = () => {
    //         const sidebarCheckbox = document.getElementById("sidebar-active");
    //         if (sidebarCheckbox) {
    //             sidebarCheckbox.checked = false;
    //         }
    //     };

    //     const sidebarLinks = document.querySelectorAll(".nav-links a");
    //     sidebarLinks.forEach((link) => {
    //         link.addEventListener("click", closeSidebar);
    //     });

    //     // Cleanup event listeners on component unmount
    //     return () => {
    //         sidebarLinks.forEach((link) => {
    //             link.removeEventListener("click", closeSidebar);
    //         });
    //     };
    // }, []);

    useEffect(() => {
        if (isAuthenticated && shouldShowNavigation) {
            const closeSidebar = () => {
                const sidebarCheckbox = document.getElementById("sidebar-active");
                if (sidebarCheckbox) {
                    sidebarCheckbox.checked = false;
                }
            };

            const sidebarLinks = document.querySelectorAll(".nav-links a");
            sidebarLinks.forEach((link) => {
                link.addEventListener("click", closeSidebar);
            });

            // Cleanup event listeners on component unmount
            return () => {
                sidebarLinks.forEach((link) => {
                    link.removeEventListener("click", closeSidebar);
                });
            };
        }
    }, [isAuthenticated, shouldShowNavigation]); // Add dependencies to ensure useEffect runs when these values change

    // Early return if the Navbar should not be shown
    if (!isAuthenticated || !shouldShowNavigation) {
        return null;
    }

    return (
        <>
            <div className="site-header">
                <div className="container-nav">
                    <div className="header-elements">
                        <div className="site-title">
                            <Logo />
                        </div>
                        <div className="navigation">
                            <input type="checkbox" id="sidebar-active" />
                            <label htmlFor="sidebar-active" className="open-sidebar-button">
                                <img className="menu-btn" src="/images/menu.svg" alt="menu-icon" />
                            </label>
                            <label id="overlay" htmlFor="sidebar-active"></label>
                            <div className="links-container">
                                <label htmlFor="sidebar-active" className="close-sidebar-button">
                                    <img className="menu-btn" src="/images/close.svg" alt="close-icon" />
                                </label>
                                <ul className="nav-links">
                                    <li>
                                        <Link href="/upload">
                                            <p>Upload</p>
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/export">
                                            <p>Export</p>
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/search">
                                            <p>Search</p>
                                        </Link>
                                    </li>
                                </ul>
                                <button className="btn" style={{ color: "#000" }} onClick={logout}>
                                    Log out
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
        ;
};

export default Navbar;