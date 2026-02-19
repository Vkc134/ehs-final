import React, { createContext, useContext, useState, useEffect } from "react";
import axiosInstance from "@/api/axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem("ehs_token"));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            // Decode user from token or use stored user data
            // For simplicity, we'll store user object in localstorage too or decode jwt
            // Here we assume the login response gave us the user object and we might store it
            const storedUser = localStorage.getItem("ehs_user");
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
            // axiosInstance interceptor already handles token attachment from localStorage
            // But we can also set default header if we want to be sure, though interceptor is better
            // axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`; 
        } else {
            // delete axiosInstance.defaults.headers.common["Authorization"];
            setUser(null);
        }
        setLoading(false);
    }, [token]);

    const login = (newToken, userData) => {
        localStorage.setItem("ehs_token", newToken);
        localStorage.setItem("ehs_user", JSON.stringify(userData));
        setToken(newToken);
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem("ehs_token");
        localStorage.removeItem("ehs_user");
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
