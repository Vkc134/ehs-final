import axios from "axios";

const axiosInstance = axios.create({
    baseURL: (import.meta.env.MODE === 'production' ? '' : (import.meta.env.VITE_API_URL || "")) + "/api",
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

// Response Interceptor: Unwrap ApiResponse wrapper + Handle 401s
axiosInstance.interceptors.response.use(
    (response) => {
        // Auto-unwrap ApiResponse<T> { success, message, data, errors }
        // so existing frontend code that expects raw data still works
        const body = response.data;
        if (
            body &&
            typeof body === "object" &&
            "success" in body &&
            "data" in body
        ) {
            // Return a new response with just the inner data
            return { ...response, data: body.data };
        }
        return response;
    },
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
