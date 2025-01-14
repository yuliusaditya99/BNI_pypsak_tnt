sap.ui.define([
    "sap/ui/base/Object",
    "sap/m/BusyDialog",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "../util/Config"
], function (UI5Object, BusyDialog, MessageToast, MessageBox, Config) {
    "use strict";

    return UI5Object.extend("sap.ui.bni.toolpageapp.controller.Config.API", {
        constructor: function () {
            this.busyDialog = new BusyDialog();
        },

        showLoading: function () {
            this.busyDialog.open();
        },

        hideLoading: function () {
            this.busyDialog.close();
        },

        // Load App Config
        loadConfig: async function () {
            try {
                this.showLoading();
                const response = await axios.get("/config_ui");
                const config = response.data;

                this.appName = config.app_name;
                this.token = config.token;
                localStorage.setItem("authToken", this.token);
            } catch (error) {
                MessageBox.error("Failed to load configuration.");
            } finally {
                this.hideLoading();
            }
        },

        // Login
        // login: async function (credentials) {
        //     try {
        //         this.showLoading();
        //         console.log("Starting login process with credentials:", credentials);
        //         console.log("before response");
        //         const response = await axios.post(Config.paths.apiBaseUrl+ "/api/login", credentials);
        //         console.log("after response");
        //         const { token, user } = response.data;

        //         // Save token and user info
        //         localStorage.setItem("authToken", token);
        //         localStorage.setItem("user", JSON.stringify(user));
        //         axios.defaults.headers.common['Authorization'] = 'Bearer '+token;
        //         console.log("masuk oRouter");
                
        //         const oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        //         console.log("oRouter : ", oRouter);
        //         oRouter.navTo("app");

        //         // console
        //         // MessageToast.show("Login successful!");

        //         return response.data;
        //     } catch (error) {
        //         MessageBox.error("Invalid credentials. Please try again.");
        //         throw error;
        //     } finally {
        //         this.hideLoading();
        //     }
        // },

        login: async function (credentials) {
            axios.defaults.headers.common["Authorization"] = "Bearer " + localStorage.getItem("authToken");
            try {
                this.showLoading();
                console.log("Starting login process with credentials:", credentials);
                console.log("URL :", Config.paths.apiBaseUrl + "/api/login");
                
                const response = await axios.post(Config.paths.apiBaseUrl + "/api/login", credentials, { timeout: 400000 });
                console.log("response X :", response);
                const token = response.data.payloads.token;
                const user = response.data.payloads.user;
                const id = user.id;
                const webSocket = response.data.payloads.ws + "/ws/" + id;
        
                console.log("Token:", token);
                console.log("WebSocket URL:", webSocket);
        
                if (typeof Storage !== "undefined") {
                    localStorage.setItem("authToken", token);
                    localStorage.setItem("user", JSON.stringify(user));
                    localStorage.setItem("websocet", webSocket);
                }
        
                axios.defaults.headers.common["Authorization"] = "Bearer " + token;
                return response.data;
            } catch (error) {
                console.error("Login error:", error);
                throw error;
            } finally {
                this.hideLoading();
            }
        },
        

        // Logout
        logout: async function () {
            try {
                await axios.post(Config.paths.apiBaseUrl + "/api/auth/logout");
                localStorage.removeItem("authToken");
                localStorage.removeItem("user");
                MessageToast.show("Logged out successfully.");
                window.location.href = "/login";
            } catch (error) {
                MessageBox.error("Error logging out.");
            }
        }
    });
});
