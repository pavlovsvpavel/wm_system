'use client';
import Link from "next/link";
import "./navbar.css"
import Logo from "./Logo";
import LogoutButton from "./LogoutButton";
import {useEffect} from "react";

const Navbar = () => {
    // Function to close the sidebar
    const closeSidebar = () => {
        const sidebarCheckbox = document.getElementById("sidebar-active");
        if (sidebarCheckbox) {
            sidebarCheckbox.checked = false; // Uncheck the checkbox to close the sidebar
        }
    };

    // Add event listeners to all sidebar links to close the sidebar when clicked
    useEffect(() => {
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
    }, []);
    return (
        <>
            <div className="site-header">
                <div className="container-nav">
                    <div className="header-elements">
                        <div className="site-title">
                            <Logo/>
                        </div>
                        <div className="navigation">
                            <input type="checkbox" id="sidebar-active"/>
                            <label htmlFor="sidebar-active" className="open-sidebar-button">
                                <img className="menu-btn" src="/images/menu.svg" alt="menu-icon"/>
                            </label>
                            <label id="overlay" htmlFor="sidebar-active"></label>
                            <div className="links-container">
                                <label htmlFor="sidebar-active" className="close-sidebar-button">
                                    <img className="menu-btn" src="/images/close.svg" alt="close-icon"/>
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
                                <LogoutButton/>
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