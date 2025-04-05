import {useState, useEffect, useCallback, useMemo} from "react";
import {toast} from "react-toastify";
import {useRouter, usePathname} from "next/navigation";
import "react-toastify/dist/ReactToastify.css";

export function useAuthState() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState(null);
    const router = useRouter();
    const pathname = usePathname();

    const setAuthData = useCallback((token, userData) => {
        try {
            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(userData));
            setIsAuthenticated(true);
            setUser(userData);
        } catch (error) {
            toast.error("Failed to save login information. Please try again.");
            logout();
        }
    }, []);

    const clearAuthData = useCallback(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        sessionStorage.removeItem("latest_file_id");
        sessionStorage.removeItem("latest_file_name");

        setIsAuthenticated(false);
        setUser(null);
    }, []);

    const logout = useCallback(() => {
        clearAuthData();
        window.location.href = "/";
    }, [clearAuthData]);

    useEffect(() => {
        try {
            const token = localStorage.getItem("token");
            const storedUser = localStorage.getItem("user");
            const parsedUser = storedUser ? JSON.parse(storedUser) : null;

            if (token && parsedUser) {
                setIsAuthenticated(true);
                setUser(parsedUser);
            } else {
                clearAuthData();
            }
        } catch {
            clearAuthData();
        } finally {
            setIsLoading(false);
        }
    }, [clearAuthData]);

    useEffect(() => {
        const handleStorageChange = (event) => {
            if (event.key === "token" || event.key === "user") {
                try {
                    const token = localStorage.getItem("token");
                    const storedUser = localStorage.getItem("user");
                    const parsedUser = storedUser ? JSON.parse(storedUser) : null;

                    setIsAuthenticated(!!token && !!parsedUser);
                    setUser(parsedUser);
                } catch {
                    clearAuthData();
                }
            }
        };

        window.addEventListener("storage", handleStorageChange);
        return () => window.removeEventListener("storage", handleStorageChange);
    }, [clearAuthData]);

    const publicRoutes = useMemo(() => ["/", "/login", "/register"], []);

    useEffect(() => {
        if (!isLoading && !isAuthenticated && !publicRoutes.includes(pathname)) {
            router.push("/login");
            toast.warning("You are not authenticated. Please log in.");
        }
    }, [isAuthenticated, isLoading, pathname, publicRoutes, router]);

    return {isAuthenticated, isLoading, user, login: setAuthData, logout};
}
