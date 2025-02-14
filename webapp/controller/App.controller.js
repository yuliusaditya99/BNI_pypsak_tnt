sap.ui.define([
	'./BaseController',
	'sap/m/ResponsivePopover',
	'sap/m/MessagePopover',
	'sap/m/ActionSheet',
	'sap/m/Button',
	'sap/m/Link',
	'sap/m/NotificationListItem',
	'sap/m/MessageItem',
	'sap/ui/core/CustomData',
	'sap/m/MessageToast',
	'sap/ui/Device',
	'sap/ui/core/syncStyleClass',
	'sap/m/library',
	'./Config.API'
], function(
	BaseController,
	ResponsivePopover,
	MessagePopover,
	ActionSheet,
	Button,
	Link,
	NotificationListItem,
	MessageItem,
	CustomData,
	MessageToast,
	Device,
	syncStyleClass,
	mobileLibrary,
	Config
	) 
	{
	"use strict";

	var PlacementType = mobileLibrary.PlacementType;
	var VerticalPlacementType = mobileLibrary.VerticalPlacementType;
	var ButtonType = mobileLibrary.ButtonType;

	return BaseController.extend("sap.ui.demo.toolpageapp.controller.App", {
		_bExpanded: true,
		onInit: function() {
			const usernameLogin = localStorage.getItem("userNameLogin");

			console.log("masuk app controller");
			this.appConfig = new Config();
		
			const oSideModel = new sap.ui.model.json.JSONModel();
			oSideModel.loadData("model/sideContent.json"); 
			this.getView().setModel(oSideModel, "side");		
			var oViewModelUser = new sap.ui.model.json.JSONModel({
				username: "Guest" 
			});
			this.getView().setModel(oViewModelUser, "user");
		
			this.msiWebSocket(localStorage.getItem("websocet"));
		
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			console.log("oRouter is login : ", oRouter);
		
			var oViewModel = new sap.ui.model.json.JSONModel({
				isLoginPage: true 
			});
		
			this.getView().setModel(oViewModel, "view");
		
			oRouter.attachRoutePatternMatched(function(oEvent) {
				var sRouteName = oEvent.getParameter("name");
				console.log("sRouteName : ", sRouteName);
				var bIsLogin = (sRouteName === "login"); 
				console.log("bIsLogin : ", bIsLogin);
				oViewModel.setProperty("/isLoginPage", !bIsLogin); 
			});
		
			console.log("userNameLogin App : ", usernameLogin);
			if (usernameLogin!="") {
				console.log("username ini");
				oViewModelUser.setProperty("/username", usernameLogin);
			} else {
				console.log("username tidak");
				oViewModelUser.setProperty("/username", "Guest");
			}
			oViewModelUser.updateBindings(true);
			sap.ui.getCore().applyChanges();

			var oLogModel = new sap.ui.model.json.JSONModel({ logs: [] });
            this.getView().setModel(oLogModel, "logModel");

			if (!oLogModel) {
				console.error("logModel tidak ditemukan!");
			} else {
				this.logInfo("Aplikasi Start","-");
			}			
			
			this.captureConsoleLogs();
		},
		

		onExit: function() {
			Device.media.detachHandler(this._handleWindowResize, this);
		},

		onRouteChange: function (oEvent) {
			this.getModel('side').setProperty('/selectedKey', oEvent.getParameter('name'));

			if (Device.system.phone) {
				this.onSideNavButtonPress();
			}
		},

		onUserNamePress: function(oEvent) {
			var oSource = oEvent.getSource();
			this.getModel("i18n").getResourceBundle().then(function(oBundle){
				// close message popover
				var oMessagePopover = this.byId("errorMessagePopover");
				if (oMessagePopover && oMessagePopover.isOpen()) {
					oMessagePopover.destroy();
				}
				var fnHandleUserMenuItemPress = function (oEvent) {
					this.onLogoutPress();
				}.bind(this);
				var oActionSheet = new ActionSheet(this.getView().createId("userMessageActionSheet"), {
					title: oBundle.getText("userHeaderTitle"),
					showCancelButton: false,
					buttons: [
						new Button({
							text: '{i18n>userAccountLogout}',
							type: ButtonType.Transparent,
							press: fnHandleUserMenuItemPress
						})
					],
					afterClose: function () {
						oActionSheet.destroy();
					}
				});
				this.getView().addDependent(oActionSheet);
				// forward compact/cozy style into dialog
				syncStyleClass(this.getView().getController().getOwnerComponent().getContentDensityClass(), this.getView(), oActionSheet);
				oActionSheet.openBy(oSource);
			}.bind(this));
		},

		onSideNavButtonPress: function() {
			var oToolPage = this.byId("app");
			var bSideExpanded = oToolPage.getSideExpanded();
			this._setToggleButtonTooltip(bSideExpanded);
			oToolPage.setSideExpanded(!oToolPage.getSideExpanded());
		},

		_setToggleButtonTooltip : function(bSideExpanded) {
			var oToggleButton = this.byId('sideNavigationToggleButton');
			this.getBundleText(bSideExpanded ? "expandMenuButtonText" : "collpaseMenuButtonText").then(function(sTooltipText){
				oToggleButton.setTooltip(sTooltipText);
			});
		},

		// Errors Pressed
		onMessagePopoverPress: function (oEvent) {
			var oMessagePopoverButton = oEvent.getSource();
			if (!this.byId("errorMessagePopover")) {
				this.getModel("i18n").getResourceBundle().then(function(oBundle){
					var oMessagePopover = new MessagePopover(this.getView().createId("errorMessagePopover"), {
						placement: VerticalPlacementType.Bottom,
						items: {
							path: 'alerts>/alerts/errors',
							factory: this._createError.bind(this, oBundle)
						},
						afterClose: function () {
							oMessagePopover.destroy();
						}
					});
					this.byId("app").addDependent(oMessagePopover);
					syncStyleClass(this.getView().getController().getOwnerComponent().getContentDensityClass(), this.getView(), oMessagePopover);
					oMessagePopover.openBy(oMessagePopoverButton);
				}.bind(this));
			}
		},

		/**
		 * Event handler for the notification button
		 * @param {sap.ui.base.Event} oEvent the button press event
		 * @public
		 */
		onNotificationPress: function (oEvent) {
			var oSource = oEvent.getSource();
			this.getModel("i18n").getResourceBundle().then(function(oBundle){
				// close message popover
				var oMessagePopover = this.byId("errorMessagePopover");
				if (oMessagePopover && oMessagePopover.isOpen()) {
					oMessagePopover.destroy();
				}
				var oButton = new Button({
					text: oBundle.getText("notificationButtonText"),
					press: function (oEvent) {
						MessageToast.show(oBundle.getText("clickHandlerMessage", [oEvent.getSource().getText()]));
					}
				});
				var oNotificationPopover = new ResponsivePopover(this.getView().createId("notificationMessagePopover"), {
					title: oBundle.getText("notificationTitle"),
					contentWidth: "300px",
					endButton : oButton,
					placement: PlacementType.Bottom,
					content: {
						path: 'alerts>/alerts/notifications',
						factory: this._createNotification.bind(this)
					},
					afterClose: function () {
						oNotificationPopover.destroy();
					}
				});
				this.byId("app").addDependent(oNotificationPopover);
				// forward compact/cozy style into dialog
				syncStyleClass(this.getView().getController().getOwnerComponent().getContentDensityClass(), this.getView(), oNotificationPopover);
				oNotificationPopover.openBy(oSource);
			}.bind(this));
		},

		/**
		 * Factory function for the notification items
		 * @param {string} sId The id for the item
		 * @param {sap.ui.model.Context} oBindingContext The binding context for the item
		 * @returns {sap.m.NotificationListItem} The new notification list item
		 * @private
		 */
		_createNotification: function (sId, oBindingContext) {
			var oBindingObject = oBindingContext.getObject();
			var oNotificationItem = new NotificationListItem({
				title: oBindingObject.title,
				description: oBindingObject.description,
				priority: oBindingObject.priority,
				close: function (oEvent) {
					var sBindingPath = oEvent.getSource().getCustomData()[0].getValue();
					var sIndex = sBindingPath.split("/").pop();
					var aItems = oEvent.getSource().getModel("alerts").getProperty("/alerts/notifications");
					aItems.splice(sIndex, 1);
					oEvent.getSource().getModel("alerts").setProperty("/alerts/notifications", aItems);
					oEvent.getSource().getModel("alerts").updateBindings("/alerts/notifications");
					this.getBundleText("notificationMessageDeleted").then(function(sMessageText){
						MessageToast.show(sMessageText);
					});
				}.bind(this),
				datetime: oBindingObject.date,
				authorPicture: oBindingObject.icon,
				press: function () {
					this.getModel("i18n").getResourceBundle().then(function(oBundle){
						MessageToast.show(oBundle.getText("notificationItemClickedMessage", [oBindingObject.title]));
					});
				},
				customData : [
					new CustomData({
						key : "path",
						value : oBindingContext.getPath()
					})
				]
			});
			return oNotificationItem;
		},

		_createError: function (oBundle, sId, oBindingContext) {
			var oBindingObject = oBindingContext.getObject();
			var oLink = new Link("moreDetailsLink", {
				text: oBundle.getText("moreDetailsButtonText"),
				press: function(oEvent) {
					this.getBundleText("clickHandlerMessage", [oEvent.getSource().getText()]).then(function(sClickHandlerMessage){
						MessageToast.show(sClickHandlerMessage);
					});
				}.bind(this)
			});

			var oMessageItem = new MessageItem({
				title: oBindingObject.title,
				subtitle: oBindingObject.subTitle,
				description: oBindingObject.description,
				counter: oBindingObject.counter,
				link: oLink
			});
			return oMessageItem;
		},

		/**
		 * Returns a promise which resolves with the resource bundle value of the given key <code>sI18nKey</code>
		 *
		 * @public
		 * @param {string} sI18nKey The key
		 * @param {string[]} [aPlaceholderValues] The values which will repalce the placeholders in the i18n value
		 * @returns {Promise<string>} The promise
		 */
		getBundleText: function(sI18nKey, aPlaceholderValues){
			return this.getBundleTextByModel(sI18nKey, this.getOwnerComponent().getModel("i18n"), aPlaceholderValues);
		},

		_handleWindowResize: function (oDevice) {
			if ((oDevice.name === "Tablet" && this._bExpanded) || oDevice.name === "Desktop") {
				this.onSideNavButtonPress();
				this._bExpanded = (oDevice.name === "Desktop");
			}
		},

		msiWebSocket: function (urlwsc) {
			
            var ws = new WebSocket(`${urlwsc}`);
            ws.onopen = function () {
                console.log('Connected to WebSocket');
                MessageToast.show("WebSocket Connected");
            };
            ws.onclose = function (event) {
                console.log('Disconnected from WebSocket');
                MessageToast.show("WebSocket Disconnected");
            };            
            ws.onerror = function (error) {
                console.error('WebSocket error:', error);
            };
        },

		onNavItemPress: function (oEvent) {
			console.log("masuk click button");
			var sKey = oEvent.getParameter("item").getKey();
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			console.log("sKey : ",sKey);
			if (sKey) {
				oRouter.navTo(sKey);
			}
		},

		onLogoutPress: async function () {
			console.log("masuk logout");
			const oauthResponse = await this.appConfig.logout();
            console.log("oauthResponse logout : ", oauthResponse);
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("login");
			location.reload();
		},

		addLog: function (type, message, details) {
			console.log("masuk log add");
            var oLogModel = this.getView().getModel("logModel");
            var oData = oLogModel.getData();
            oData.logs.unshift({
                type: type,
                message: message,
                details: details || "-",
                timestamp: new Date().toISOString()
            });
            oLogModel.refresh();
            var logs = JSON.parse(localStorage.getItem("appLogs")) || [];
            logs.unshift({ type, message, details, timestamp: new Date().toISOString() });
            localStorage.setItem("appLogs", JSON.stringify(logs));

            MessageToast.show(type + " log ditambahkan!");
        },

        clearLogs: function () {
            this.getView().getModel("logModel").setData({ logs: [] });
            localStorage.removeItem("appLogs");
            MessageToast.show("Log dihapus!");
        },

        saveLogToFile: function () {
            var logs = JSON.parse(localStorage.getItem("appLogs")) || [];
            var logText = logs.map(log => `[${log.timestamp}] ${log.type}: ${log.message}`).join("\n");
            var blob = new Blob([logText], { type: "text/plain" });
            var a = document.createElement("a");
            a.href = URL.createObjectURL(blob);
            a.download = "log.txt";
            a.click();

            MessageToast.show("Log disimpan ke file!");
        },

		logInfo: function (message,detail) {
            this.addLog("Info",message,detail);
        },

        logWarning: function (message,detail) {
            this.addLog("Warning",message,detail);
        },

        logError: function (message,detail) {
            this.addLog("Error",message,detail);
        },

		captureConsoleLogs: function() {
            var oLogModel = this.getView().getModel("logModel");
            var originalLog = console.log;
            var originalWarn = console.warn;
            var originalError = console.error;
            var originalInfo = console.info;
            console.log = this.createConsoleMethod(oLogModel, 'Log', originalLog);
            console.warn = this.createConsoleMethod(oLogModel, 'Warning', originalWarn);
            console.error = this.createConsoleMethod(oLogModel, 'Error', originalError);
            console.info = this.createConsoleMethod(oLogModel, 'Info', originalInfo);
        },

        createConsoleMethod: function(oLogModel, type, originalMethod) {
            return function(message, details) {
                // Struktur log baru
                var oLogEntry = {
                    type: type,
                    message: message,
                    details: details || "-",
                    timestamp: new Date().toISOString()
                };
                var aLogs = oLogModel.getProperty("/logs");
                aLogs.push(oLogEntry);
                oLogModel.setProperty("/logs", aLogs);
                originalMethod.apply(console, arguments);
            }.bind(this);
        },

		saveLogToServer: function (logEntry) {
            fetch("/api/saveLog", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(logEntry)
            }).then(function(response) {
                if (!response.ok) {
                    console.error("Error saving log to server");
                }
            }).catch(function(error) {
                console.error("Request failed", error);
            });
        }

	});
});