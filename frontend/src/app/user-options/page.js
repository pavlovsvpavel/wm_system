"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from '../context/AuthContext';
import { RiDeleteBin6Line } from "react-icons/ri";
import useConditionsAndWarehousesData from '../hooks/useConditionsAndWarehousesData';
import AuthWrapper from "../components/auth/authWrapper";

export default function UserOptions() {
    const { isAuthenticated, isLoading, user } = useAuth();
    const [newCondition, setNewCondition] = useState("");
    const [newWarehouse, setNewWarehouse] = useState("");

    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

    const {
        conditions,
        warehouses,
        addCondition,
        deleteCondition,
        addWarehouse,
        deleteWarehouse,
    } = useConditionsAndWarehousesData(isAuthenticated, BASE_URL);

    const handleAddCondition = async () => {
        if (!newCondition.trim()) {
            toast.warn("Condition cannot be empty");
            return;
        }

        if (!user) {
            toast.error("User id not found. Please log out and log in again");
            return;
        }

        await addCondition(newCondition, user.id);
        setNewCondition("");
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

        await addWarehouse(newWarehouse, user.id);
        setNewWarehouse("");
    };

    const handleDeleteCondition = async (id) => {
        await deleteCondition(id);
    };

    const handleDeleteWarehouse = async (id) => {
        await deleteWarehouse(id);
    };

    return (
        <AuthWrapper>
            <div className="container">
                <h1>Settings</h1>

                <div className="options-container">
                    <div className="section">
                        <h2>Technical Conditions</h2>
                        <ul className="data">
                            {conditions.map((condition, index) => (
                                <li key={index}>{condition.technical_condition}
                                    <button onClick={() => handleDeleteCondition(condition.id)} className="delete-icon"><RiDeleteBin6Line /></button></li>
                            ))}
                        </ul>
                        <div className="add-data">
                            <input
                                type="text"
                                placeholder="New Condition"
                                value={newCondition}
                                onChange={(e) => setNewCondition(e.target.value)}
                            />
                            <button className="btn"
                                onClick={handleAddCondition}
                                disabled={!user}
                            >
                                Add Condition
                            </button>
                        </div>
                    </div>

                    <div className="section">
                        <h2>Warehouses</h2>
                        <ul className="data">
                            {warehouses.map((warehouse, index) => (
                                <li key={index}>{warehouse.whs_name}
                                    <button onClick={() => handleDeleteWarehouse(warehouse.id)} className="delete-icon"><RiDeleteBin6Line /></button>
                                </li>
                            ))}
                        </ul>
                        <div className="add-data">
                            <input
                                type="text"
                                placeholder="New Warehouse"
                                value={newWarehouse}
                                onChange={(e) => setNewWarehouse(e.target.value)}
                            />
                            <button className="btn"
                                onClick={handleAddWarehouse}
                                disabled={!user}
                            >
                                Add Warehouse
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </AuthWrapper>
    );
}