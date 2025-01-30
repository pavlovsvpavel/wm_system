import { useState, useEffect } from "react";
import { toast } from "react-toastify";

export function useFetchFiles(isAuthenticated, BASE_URL) {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (loading || !isAuthenticated) return;

        const controller = new AbortController();
        const { signal } = controller;

        const fetchFiles = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await fetch(`${BASE_URL}/api/files/get-files/`, {
                    method: "GET",
                    headers: {
                        Authorization: `Token ${token}`,
                    },
                    signal,
                });

                if (response.status === 200) {
                    const data = await response.json();
                    setFiles(data);
                    toast.success("Databases loaded successfully.");
                } else if (response.status === 204) {
                    toast.info("No uploaded databases.");
                    setFiles([]);
                } else {
                    throw new Error("Failed to fetch databases.");
                }
            } catch (error) {
                if (error.name !== "AbortError") {
                    setError(error);
                    toast.error("Failed to fetch databases. Please try again.");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchFiles();

        // Cleanup function to abort the fetch request
        return () => controller.abort();
    }, [isAuthenticated, loading]);

    return { files, loading, error };
}