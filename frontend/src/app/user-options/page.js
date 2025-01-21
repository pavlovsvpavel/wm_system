"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from '../context/AuthContext';
import { RiDeleteBin6Line } from "react-icons/ri";
import useConditionsAndWarehousesData from '../hooks/useConditionsAndWarehousesData';
import AuthWrapper from "../components/auth/authWrapper";

export default function UserOptions() {
    const { isAuthenticated } = useAuth();
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
            toast.warning("Condition cannot be empty");
            return;
        }

        await addCondition(newCondition);
        setNewCondition("");
    };

    const handleAddWarehouse = async () => {
        if (!newWarehouse.trim()) {
            toast.warning("Warehouse name cannot be empty.");
            return;
        }

        await addWarehouse(newWarehouse);
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
                            {conditions.length > 0 ? (
                                conditions.map((condition, index) => (
                                    <li key={index}>{condition.technical_condition}
                                        <button onClick={() => handleDeleteCondition(condition.id)} className="delete-icon"><RiDeleteBin6Line /></button></li>
                                ))
                            ) : (
                                <li>No saved conditions</li>
                            )}
                        </ul>
                        <div className="add-data">
                            <input
                                type="text"
                                placeholder="New condition"
                                value={newCondition}
                                onChange={(e) => setNewCondition(e.target.value)}
                            />
                            <button className="btn"
                                onClick={handleAddCondition}
                            >
                                Save
                            </button>
                        </div>
                    </div>

                    <div className="section">
                        <h2>Warehouses</h2>
                        <ul className="data">
                            {warehouses.length > 0 ? (
                                warehouses.map((warehouse, index) => (
                                    <li key={index}>
                                        {warehouse.whs_name}
                                        <button
                                            onClick={() => handleDeleteWarehouse(warehouse.id)}
                                            className="delete-icon"
                                        >
                                            <RiDeleteBin6Line />
                                        </button>
                                    </li>
                                ))
                            ) : (
                                <li>No saved warehouses</li>
                            )}
                        </ul>
                        <div className="add-data">
                            <input
                                type="text"
                                placeholder="New warehouse"
                                value={newWarehouse}
                                onChange={(e) => setNewWarehouse(e.target.value)}
                            />
                            <button className="btn"
                                onClick={handleAddWarehouse}
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </AuthWrapper>
    );
}