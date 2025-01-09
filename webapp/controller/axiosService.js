sap.ui.define([], function () {
    "use strict";

    const axiosInstance = axios.create({
        baseURL: `${window.location.origin}`,
        timeout: 10000 // Timeout for requests
    });

    // Request Interceptor
    axiosInstance.interceptors.request.use(
        (config) => {
            // Add Authorization Header
            const token = localStorage.getItem("authToken");
            if (token) {
                config.headers["Authorization"] = 'Bearer ${token}';
            }
            return config;
        },
        (error) => {
            return Promise.reject(error);
        }
    );

    // Response Interceptor
    axiosInstance.interceptors.response.use(
        (response) => {
            return response;
        },
        (error) => {
            if (error.response?.status === 401) {
                sap.m.MessageToast.show("Session expired. Please log in again.");
                setTimeout(() => {
                    window.location.href = "/login";
                }, 1000);
            }
            return Promise.reject(error);
        }
    );

    return axiosInstance;
});
