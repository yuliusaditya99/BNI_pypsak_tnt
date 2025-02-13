sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "./Config.API",
    'sap/m/MessageToast',
    'sap/m/MessageBox'
], function (Controller, Config, MessageToast, MessageBox) {
    "use strict";

    return Controller.extend("sap.ui.bni.toolpageapp.controller.Login", {
        onInit: function () {
            console.log("Login controller initialized");
            this.appConfig = new Config();
        },

        onLoginPress: async function () {
            const sUsername = this.byId("username").getValue();
            const sPassword = this.byId("password").getValue();
          
            if (!sUsername || !sPassword) {
              //sap.m.MessageToast.show("Username and password are required.");
              MessageBox.error("Username and password are required.");
              return;
            }
          
            try {
                
              const oauthResponse = await this.appConfig.login({ user_name: sUsername, password: sPassword });
              console.log("oauthResponse : ", oauthResponse);
          
              const oView = this.getView();
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
              console.log("Set Header X:", axios.defaults.headers.common["Authorization"]);
              const oViewModel = this.getView().getModel("user");

              console.log("oViewModel : ",oViewModel);
              const userNameLogin = localStorage.getItem("userNameLogin");
      
              oViewModel.setProperty("/username", userNameLogin);
              oViewModel.updateBindings(true); 
              sap.ui.getCore().applyChanges();

              localStorage.setItem("usernameExist", JSON.stringify(userNameLogin));

              const oViewModelq = this.getView().getModel("user");

              console.log("oViewModelq : ",oViewModelq);
              console.log("User Model in Project View:", this.getView().getModel("user").getData());
              oRouter.navTo("project"); // Arahkan ke halaman app setelah login berhasil              
            } catch (error) {
              const message = error.response.data.detail[0].msg;
              console.error("Routing error:", error.response.data.detail[0].msg);
              //sap.m.MessageToast.show("Terjadi kesalahan saat navigasi.");
              MessageBox.error(message);
            }
          }
    });
});
