sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "./Config.API"
], function (Controller, Config) {
    "use strict";

    return Controller.extend("sap.ui.bni.toolpageapp.controller.Login", {
        onInit: function () {
            this.appConfig = new Config();
        },

        onLoginPress: async function () {
            const sUsername = this.byId("username").getValue();
            const sPassword = this.byId("password").getValue();

            if (!sUsername || !sPassword) {
                sap.m.MessageToast.show("Username and password are required.");
                return;
            }

            try {
                console.log("masuk");
                const oauthResponse = await this.appConfig.login({ user_name: sUsername, password: sPassword });
                console.log("oauthResponse : ",oauthResponse);
                
                //const oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                //console.log("oRouter : ",oRouter);
                //oRouter.navTo("app");
                //this.getOwnerComponent().getRouter().navTo("app");
                const oView = this.getView(); // Ambil View dari Controller
                const oComponent = sap.ui.core.Component.getOwnerComponentFor(oView);
                console.log("Owner Component:", oComponent);
                if (!oComponent) {
                    throw new Error("Owner component tidak ditemukan.");
                }
                const oRouter = oComponent.getRouter();
                console.log("Router:", oRouter);
                if (!oRouter || typeof oRouter.navTo !== "function") {
                    throw new Error("Router tidak valid.");
                }
                oRouter.navTo("app");
            } catch (error) {
                console.error("Routing error:", error);
                sap.m.MessageToast.show("Terjadi kesalahan saat navigasi.");
            }
        }
    });
});
