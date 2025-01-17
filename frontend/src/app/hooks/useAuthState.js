import { useState, useEffect, useRef } from 'react';
import { toast } from "react-toastify";
import { useRouter, usePathname } from "next/navigation";
import "react-toastify/dist/ReactToastify.css";

export function useAuthState() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState(null);
    const router = useRouter();
    const pathname = usePathname();

    const safeSetLocalStorage = (key, value) => {
        try {
            localStorage.setItem(key, value);
        } catch (error) {
            console.error("Failed to set localStorage item:", error);
        }
    };

    const safeRemoveLocalStorage = (key) => {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error("Failed to remove localStorage item:", error);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem("token");
        const user = JSON.parse(localStorage.getItem("user"));

        if (token && user) {
            setIsAuthenticated(true);
            setUser(user);
        } else {
            safeRemoveLocalStorage("token");
            safeRemoveLocalStorage("user");
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        const handleStorageChange = (event) => {
            if (event.key === "token" || event.key === "user") {
                const token = localStorage.getItem("token");
                const user = JSON.parse(localStorage.getItem("user"));

                if (token && user) {
                    setIsAuthenticated(true);
                    setUser(user);
                } else {
                    setIsAuthenticated(false);
                    setUser(null);
                }
            }
        };

        window.addEventListener("storage", handleStorageChange);
        return () => window.removeEventListener("storage", handleStorageChange);
    }, []);

    const publicRoutes = ["/", "/login", "/register"];

    useEffect(() => {
        if (isLoading) return;
    
        console.log("useAuthState - Current route:", pathname);
        console.log("useAuthState - Is authenticated:", isAuthenticated);
    
        if (!isAuthenticated && !publicRoutes.includes(pathname)) {
            if (pathname !== '/') {
                console.log("useAuthState - Redirecting to /login");
                router.push('/login');
                toast.info("You are not authenticated. Please log in.");
            }
        }
    }, [isAuthenticated, isLoading, pathname, router]);

    const login = (token, user) => {
        
        safeSetLocalStorage("token", token);
        safeSetLocalStorage("user", JSON.stringify(user));
        setIsAuthenticated(true);
        setUser(user);
    };

    const logout = () => {
        console.log("Logout is called");
        safeRemoveLocalStorage("token");
        safeRemoveLocalStorage("user");
        sessionStorage.removeItem("latest_file_id");
        sessionStorage.removeItem("latest_file_name");
        console.log("Redirecting to /");
        window.location.href = '/'; // Force a full page reload
    };

    return { isAuthenticated, isLoading, user, login, logout };
}