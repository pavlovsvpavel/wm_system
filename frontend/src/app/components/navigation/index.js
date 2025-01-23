'use client';

import { usePathname } from "next/navigation";
import Link from "next/link";
import "../../../styles/globals.css"
import { useEffect } from "react";
import { useAuth } from "../../context/AuthContext";


const Navigation = () => {
    const { isAuthenticated, logout, user } = useAuth();
    const pathname = usePathname();

    const showNavigationRoutes = ["/dashboard", "/upload", "/export", "/search", "/qr-scanner", "/user-options"];
    const shouldShowNavigation = showNavigationRoutes.includes(pathname);

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

            return () => {
                sidebarLinks.forEach((link) => {
                    link.removeEventListener("click", closeSidebar);
                });
            };
        }
    }, [isAuthenticated, shouldShowNavigation]);

    if (!isAuthenticated || !shouldShowNavigation) {
        return null;
    }

    return (
        <>
            <div className="site-header">
                <div className="container-nav">
                    <div className="header-elements">
                        <div className="site-title">
                            <Link href="/dashboard">
                                <img src="/images/Pepsi-logo.png" alt="Logo" />
                            </Link>
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
                                    {user?.is_staff ? (
                                        <>
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
                                        </>
                                    ) : null}
                                    <li>
                                        <Link href="/search">
                                            <p>Search</p>
                                        </Link>
                                    </li>
                                    {user?.is_staff && (
                                        <li>
                                            <Link href="/user-options">
                                                <p>Settings</p>
                                            </Link>
                                        </li>
                                    )}
                                </ul>
                                <button className="nav-btn" style={{ color: "#000" }} onClick={logout}>
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

export default Navigation;