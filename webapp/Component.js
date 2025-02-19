sap.ui.define([
	"sap/ui/core/UIComponent",
	"./model/models",
	"sap/ui/core/routing/History",
	"sap/ui/Device",
	"sap/ui/model/resource/ResourceModel"	
], function(UIComponent, models, History, Device) {
	"use strict";

	return UIComponent.extend("sap.ui.bni.toolpageapp.Component", {
		metadata: {
			manifest: "json",
			interfaces: ["sap.ui.core.IAsyncContentCreation"]
		},

		init: function () {
			// Panggil init dari parent
			UIComponent.prototype.init.apply(this, arguments);
		  
			// Buat model untuk perangkat
			this.setModel(models.createDeviceModel(), "device");

			this.setModel(models.createLogModel(), "logModel");			

			// var oLogModel = models.createLogModel();
			// this.setModel(oLogModel, "logModel");

			// console.log("✅ logModel berhasil didaftarkan:", oLogModel.getData());
		  
			// Inisialisasi router
			// var oLogModel = models.createLogModel();
			// this.setModel(oLogModel, "logModel");

			// console.log("✅ logModel berhasil didaftarkan:", oLogModel.getData());
		  
			// Inisialisasi router
			this.getRouter().initialize();
			this.getRouter().attachBeforeRouteMatched(this._onBeforeRouteMatched, this);
		},

		// init: function () {
		// 	// call the init function of the parent
		// 	UIComponent.prototype.init.apply(this, arguments);

		// 	// set the device model
		// 	//this.setModel(models.createDeviceModel(), "device");

		// 	// create the views based on the url/hash

		// 	// var oRouter = this.getRouter();
		// 	// console.log("Routes:", oRouter._oRoutes);
		// 	// console.log("Targets:", oRouter._oTargets);
		// 	this.getRouter().initialize();
		// 	console.log("after initial");

		// 	  // Panggil init dari parent
		// 	  UIComponent.prototype.init.apply(this, arguments);

		// 	  // Buat model untuk perangkat
		// 	  this.setModel(models.createDeviceModel(), "device");
  
		// 	  // Inisialisasi router
		// 	  this.getRouter().initialize();
			
		// },

		myNavBack: function () {
			var oHistory = History.getInstance();
			var oPrevHash = oHistory.getPreviousHash();
			if (oPrevHash !== undefined) {
				window.history.go(-1);
			} else {
				this.getRouter().navTo("masterSettings", {}, true);
			}
		},
		
		getContentDensityClass: function () {
			if (!this._sContentDensityClass) {
				if (!Device.support.touch){
					this._sContentDensityClass = "sapUiSizeCompact";
				} else {
					this._sContentDensityClass = "sapUiSizeCozy";
				}
			}
			return this._sContentDensityClass;
		},

		_onBeforeRouteMatched: function(oEvent) {
            var oRouter = this.getRouter();
            var oRouteName = oEvent.getParameter("name");

            // Cek token atau status login
            var isLoggedIn = !!localStorage.getItem("authToken"); // Cek token login

            if (!isLoggedIn && oRouteName !== "login") {
                console.log("tidak login");
                oRouter.navTo("login");
				location.reload();
            }
        }

		
	});
});