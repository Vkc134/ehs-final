import axios from "axios";

const axiosInstance = axios.create({
    baseURL: (import.meta.env.VITE_API_URL || "http://localhost:5266") + "/api",
    headers: {
        "Content-Type": "application/json",
    },
});

// Request Interceptor: Attach Token
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("ehs_token");
        if (token) {
            config.headers["Authorization"] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401s
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Optional: Clear storage or redirect, but be careful of loops
            localStorage.removeItem("ehs_token");
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
