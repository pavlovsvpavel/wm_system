import { useState, useEffect } from "react";
import { toast } from "react-toastify";

const useFetchConditionsAndWarehouses = (isAuthenticated, BASE_URL) => {
    const [conditions, setConditions] = useState([]);
    const [warehouses, setWarehouses] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            if (!isAuthenticated) return;

            try {
                const token = localStorage.getItem("token");

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

                const conditionsData = await conditionsResponse.json();
                const warehousesData = await warehousesResponse.json();

                setConditions(Array.isArray(conditionsData) ? conditionsData : []);
                setWarehouses(Array.isArray(warehousesData) ? warehousesData : []);
            } catch (error) {
                setConditions([]);
                setWarehouses([]);
                toast.error("Failed to fetch conditions or warehouses.");
            }
        };

        fetchData();
    }, [isAuthenticated, BASE_URL]);

    // Function to add a new condition
    const addCondition = async (newCondition) => {
        try {
            const token = localStorage.getItem("token");
            const payload = {
                technical_condition: newCondition,
            };

            const response = await fetch(`${BASE_URL}/api/accounts/user/technical-conditions/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Token ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error("Failed to add condition");
            }

            const newConditionData = await response.json();
            setConditions((prevConditions) => [...prevConditions, newConditionData]);
            toast.success("Condition added successfully");
        } catch (error) {
            console.error("Error adding new condition:", error);
            toast.error("Failed to add condition.");
        }
    };

    // Function to delete a condition
    const deleteCondition = async (id) => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${BASE_URL}/api/accounts/user/technical-conditions/${id}/`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Token ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error("Failed to delete condition");
            }

            setConditions((prevConditions) => prevConditions.filter((condition) => condition.id !== id));
            toast.success("Condition deleted successfully.");
        } catch (error) {
            console.error("Error deleting condition:", error);
            toast.error("Failed to delete condition.");
        }
    };

    // Function to add a new warehouse
    const addWarehouse = async (newWarehouse) => {
        try {
            const token = localStorage.getItem("token");
            const payload = {
                whs_name: newWarehouse,
            };

            const response = await fetch(`${BASE_URL}/api/accounts/user/whs-names/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Token ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error("Failed to add warehouse");
            }

            const newWarehouseData = await response.json();
            setWarehouses((prevWarehouses) => [...prevWarehouses, newWarehouseData]);
            toast.success("Warehouse added successfully!");
        } catch (error) {
            console.error("Error adding new warehouse:", error);
            toast.error("Failed to add warehouse.");
        }
    };

    // Function to delete a warehouse
    const deleteWarehouse = async (id) => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${BASE_URL}/api/accounts/user/whs-names/${id}/`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Token ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error("Failed to delete warehouse");
            }

            setWarehouses((prevWarehouses) => prevWarehouses.filter((warehouse) => warehouse.id !== id));
            toast.success("Warehouse deleted successfully.");
        } catch (error) {
            console.error("Error deleting warehouse:", error);
            toast.error("Failed to delete warehouse.");
        }
    };

    return {
        conditions,
        warehouses,
        addCondition,
        deleteCondition,
        addWarehouse,
        deleteWarehouse,
    };
};

export default useFetchConditionsAndWarehouses;