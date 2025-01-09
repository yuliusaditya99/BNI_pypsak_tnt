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
            const oController = this; // Simpan referensi controller
            try {
                oController.showLoading();
                console.log("Starting login process with credentials:", credentials);
        
                const response = await axios.post(Config.paths.apiBaseUrl + "/api/login", credentials);
                //console.log("response X :",response);
                const token = response.data.payloads.token;
                const user = response.data.payloads.user;
                console.log("token : ",token);
        
                if (typeof Storage !== "undefined") {
                    localStorage.setItem("authToken", token);
                    localStorage.setItem("user", JSON.stringify(user));
                }
                console.log("after set global var");
        
                axios.defaults.headers.common["Authorization"] = "Bearer " + token;
                console.log("after set authorization");
                console.log("Set Header:", axios.defaults.headers.common["Authorization"]);

                
                
                //console.log(this.getView());
                //const oView = this.getView(); // Ambil View dari Controller
                //console.log(this.getView());
                //const oComponent = sap.ui.core.Component.getOwnerComponentFor(oView);
                //const oComponent = sap.ui.core.Component.getOwnerComponentFor(oController.getView());
                //console.log("Owner Component:", oComponent);
        
                //const oRouter = oComponent.getRouter();
                //console.log("Router:", oRouter);            
                //oRouter.navTo("app"); // Navigasi ke halaman App
                //sap.ui.core.UIComponent.getRouterFor(this).navTo("app");
              
                return response.data;
            } catch (error) {
                if (error.response) {
                    console.error("API Error Response:", error.response.data);
                } else if (error.request) {
                    console.error("No response received:", error.request);
                } else {
                    console.error("Error during setup:", error.message);
                }
                throw error;
            } finally {
                oController.hideLoading();
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
