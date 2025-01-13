"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from '../context/AuthContext';
import { RiDeleteBin6Line } from "react-icons/ri";

export default function UserOptions() {
    const router = useRouter();
    const { isAuthenticated, isLoading, user } = useAuth();
    const [conditions, setConditions] = useState([]);
    const [newCondition, setNewCondition] = useState("");
    const [warehouses, setWarehouses] = useState([]);
    const [newWarehouse, setNewWarehouse] = useState("");
    const [loading, setLoading] = useState(false);

    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login');
            toast.info("You are not authenticated. Please log in.");
        }
    }, [isAuthenticated, isLoading]);

    useEffect(() => {
        const fetchData = async () => {
            if (isAuthenticated) {
                setLoading(true);
                try {
                    const token = localStorage.getItem("token");

                    // Fetch conditions and warehouses with token in headers
                    const [conditionsResponse, warehousesResponse] = await Promise.all([
                        fetch(`${BASE_URL}/api/accounts/user/technical-conditions/`, {
                            headers: {
                                "Authorization": `Token ${token}`,
                            },
                        }),
                        fetch(`${BASE_URL}/api/accounts/user/whs-names/`, {
                            headers: {
                                "Authorization": `Token ${token}`,
                            },
                        }),
                    ]);

                    // Handle unauthorized responses
                    if (conditionsResponse.status === 401 || warehousesResponse.status === 401) {
                        localStorage.removeItem("token"); // Clear invalid token
                        localStorage.removeItem("user"); // Clear user data
                        router.push('/login');
                        toast.error("Your session has expired. Please log in again.");
                        return;
                    }

                    if (!conditionsResponse.ok || !warehousesResponse.ok) {
                        throw new Error("Failed to fetch conditions or warehouses");
                    }

                    const conditionsData = await conditionsResponse.json();
                    const warehousesData = await warehousesResponse.json();

                    setConditions(Array.isArray(conditionsData) ? conditionsData : []);
                    setWarehouses(Array.isArray(warehousesData) ? warehousesData : []);
                } catch (error) {
                    console.error("Error fetching data:", error);
                    setConditions([]);
                    setWarehouses([]);
                    toast.error("Failed to fetch conditions or warehouses.");
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchData();
    }, [isAuthenticated, BASE_URL, user]);


    const handleAddCondition = async () => {
        if (!newCondition.trim()) {
            toast.warn("Condition can not be empty");
            return;
        }

        if (!user) {
            toast.error("User id not found. Please log out and log in again");
            return;
        }

        try {
            setLoading(true);

            const payload = {
                technical_condition: newCondition,
                user_id: user.id,
            };

            const response = await fetch(`${BASE_URL}/api/accounts/user/technical-conditions/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Token ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify(payload),
            });

            // Handle unauthorized responses
            if (response.status === 401) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                router.push('/login');
                toast.error("Your session has expired. Please log in again.");
                return;
            }

            if (!response.ok) {
                const errorData = await response.json();
                console.log(errorData.message);
                throw new Error("Failed to add condition");
            }

            const newConditionData = await response.json();
            setConditions((prevConditions) => [...prevConditions, newConditionData]);
            setNewCondition("");
            toast.success("Condition added successfully");
        } catch (error) {
            console.error("Error adding new condition:", error);
            toast.error("Failed to add condition.");
        } finally {
            setLoading(false);
        }
    };

    const handleAddWarehouse = async () => {
        if (!newWarehouse.trim()) {
            toast.warn("Warehouse name cannot be empty.");
            return;
        }

        if (!user) {
            toast.error("User id not found. Please log out and log in again");
            return;
        }

        try {
            setLoading(true);

            const payload = {
                whs_name: newWarehouse,
                user_id: user.id,
            };

            const response = await fetch(`${BASE_URL}/api/accounts/user/whs-names/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Token ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify(payload),
            });

            // Handle unauthorized responses
            if (response.status === 401) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                router.push('/login');
                toast.error("Your session has expired. Please log in again.");
                return;
            }

            if (!response.ok) {
                throw new Error("Failed to add warehouse");
            }

            const newWarehouseData = await response.json();
            setWarehouses((prevWarehouses) => [...prevWarehouses, newWarehouseData]);
            setNewWarehouse("");
            toast.success("Warehouse added successfully!");
        } catch (error) {
            console.error("Error adding new warehouse:", error);
            toast.error("Failed to add warehouse.");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteCondition = async (id) => {
        try {
            setLoading(true);
            const response = await fetch(`${BASE_URL}/api/accounts/user/technical-conditions/${id}/`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Token ${localStorage.getItem("token")}`,
                },
            });

            if (response.status === 401) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                router.push('/login');
                toast.error("Your session has expired. Please log in again.");
                return;
            }

            if (!response.ok) {
                throw new Error("Failed to delete condition");
            }

            setConditions((prevConditions) => prevConditions.filter((condition) => condition.id !== id));
            toast.success("Condition deleted successfully.");
        } catch (error) {
            console.error("Error deleting condition:", error);
            toast.error("Failed to delete condition.");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteWarehouse = async (id) => {
        try {
            setLoading(true);
            const response = await fetch(`${BASE_URL}/api/accounts/user/whs-names/${id}/`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Token ${localStorage.getItem("token")}`,
                },
            });

            if (response.status === 401) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                router.push('/login');
                toast.error("Your session has expired. Please log in again.");
                return;
            }

            if (!response.ok) {
                throw new Error("Failed to delete warehouse");
            }

            setWarehouses((prevWarehouses) => prevWarehouses.filter((warehouse) => warehouse.id !== id));
            toast.success("Warehouse deleted successfully.");
        } catch (error) {
            console.error("Error deleting warehouse:", error);
            toast.error("Failed to delete warehouse.");
        } finally {
            setLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="loading-spinner">
                <p>Loading</p>
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="container">
            <h1>Settings</h1>

            <div className="options-container">
                <div className="section">
                    <h2>Technical Conditions</h2>
                    <ul>
                        {conditions.map((condition, index) => (
                            <li key={index}>{condition.technical_condition}
                            <button onClick={() => handleDeleteCondition(condition.id)} className="delete-icon"><RiDeleteBin6Line /></button></li>
                        ))}
                    </ul>
                    <div className="add-option">
                        <input
                            type="text"
                            placeholder="New Condition"
                            value={newCondition}
                            onChange={(e) => setNewCondition(e.target.value)}
                        />
                        <button className="btn"
                            onClick={handleAddCondition}
                            disabled={!user || loading}
                        >
                            Add Condition
                        </button>
                    </div>
                </div>

                <div className="section">
                    <h2>Warehouses</h2>
                    <ul>
                        {warehouses.map((warehouse, index) => (
                            <li key={index}>{warehouse.whs_name}
                            <button onClick={() => handleDeleteWarehouse(warehouse.id)} className="delete-icon"><RiDeleteBin6Line /></button>
                            </li>
                        ))}
                    </ul>
                    <div className="add-option">
                        <input
                            type="text"
                            placeholder="New Warehouse"
                            value={newWarehouse}
                            onChange={(e) => setNewWarehouse(e.target.value)}
                        />
                        <button className="btn"
                            onClick={handleAddWarehouse}
                            disabled={!user || loading}
                        >
                            Add Warehouse
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}