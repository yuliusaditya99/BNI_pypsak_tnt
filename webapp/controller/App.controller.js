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
	"./Config.API"
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
) {
	"use strict";

	// shortcut for sap.m.PlacementType
	var PlacementType = mobileLibrary.PlacementType;

	// shortcut for sap.m.VerticalPlacementType
	var VerticalPlacementType = mobileLibrary.VerticalPlacementType;

	// shortcut for sap.m.ButtonType
	var ButtonType = mobileLibrary.ButtonType;

	return BaseController.extend("sap.ui.demo.toolpageapp.controller.App", {

		_bExpanded: true,

		onInit: function() {
			console.log("masuk app controller");
			this.appConfig = new Config();
			var login = this.onLoginPress();
			if (login = true)
			{
				console.log("login:", login);
				this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());			
				
				// if the app starts on desktop devices with small or medium screen size, collaps the side navigation
				if (Device.resize.width <= 1024) {
					this.onSideNavButtonPress();
				}

				Device.media.attachHandler(this._handleWindowResize, this);
				this.getRouter().attachRouteMatched(this.onRouteChange.bind(this));
				console.log("websocet : ",localStorage.getItem("websocet"));
				this.msiWebSocket(localStorage.getItem("websocet"));
				console.log("Set Header X:", axios.defaults.headers.common["Authorization"]);
			}
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
					this.getBundleText("clickHandlerMessage", [oEvent.getSource().getText()]).then(function(sClickHandlerMessage){
						MessageToast.show(sClickHandlerMessage);
					});
				}.bind(this);
				var oActionSheet = new ActionSheet(this.getView().createId("userMessageActionSheet"), {
					title: oBundle.getText("userHeaderTitle"),
					showCancelButton: false,
					buttons: [
						new Button({
							text: '{i18n>userAccountUserSettings}',
							type: ButtonType.Transparent,
							press: fnHandleUserMenuItemPress
						}),
						new Button({
							text: "{i18n>userAccountOnlineGuide}",
							type: ButtonType.Transparent,
							press: fnHandleUserMenuItemPress
						}),
						new Button({
							text: '{i18n>userAccountFeedback}',
							type: ButtonType.Transparent,
							press: fnHandleUserMenuItemPress
						}),
						new Button({
							text: '{i18n>userAccountHelp}',
							type: ButtonType.Transparent,
							press: fnHandleUserMenuItemPress
						}),
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
					// forward compact/cozy style into dialog
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

		onLoginPress: async function () {
            const sUsername = "admin";
            const sPassword = "admin";

            if (!sUsername || !sPassword) {
                sap.m.MessageToast.show("Username and password are required.");
                return;
            }

            try {
                console.log("masuk login");
                const oauthResponse = await this.appConfig.login({ user_name: sUsername, password: sPassword });
                console.log("oauthResponse : ",oauthResponse);
                
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
				return true;
                //oRouter.navTo("app");
            } catch (error) {
                console.error("Routing error:", error);
                sap.m.MessageToast.show("Terjadi kesalahan saat navigasi.");
            }
        },

		_handleWindowResize: function (oDevice) {
			if ((oDevice.name === "Tablet" && this._bExpanded) || oDevice.name === "Desktop") {
				this.onSideNavButtonPress();
				// set the _bExpanded to false on tablet devices
				// extending and collapsing of side navigation should be done when resizing from
				// desktop to tablet screen sizes)
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

            ws.onmessage = function (event) {
                const is_parse = msiIsAllowJsonParse(event.data);
                if (is_parse) {
                    const ed = JSON.parse(event.data);
                    const ed_error = w.msi.objectHas(ed, 'error');
                    const ed_message = w.msi.objectHas(ed, 'message');
                    const ed_payloads = w.msi.objectHas(ed, 'payloads');
                    const payload_uid = w.msi.objectHas(ed_payloads, 'uid');

                    if (w.msi.user.id === payload_uid) {
                        if (!ed_error) {
                            const payload_task_id = w.msi.objectHas(ed_payloads, 'task_id');
                            if (payload_task_id) {
                                const payload_is_process = w.msi.objectHas(ed_payloads, 'is_process');
                                if (payload_is_process) {
                                    MessageToast.show(`Task ${payload_task_id} in process: ${ed_message}`);
                                    // Anda bisa menampilkan notifikasi di UI sesuai dengan logika ini
                                } else {
                                    MessageToast.show(`Task ${payload_task_id} completed: ${ed_message}`);
                                }
                            }
                        } else {
                            MessageToast.show(`Error: ${ed_message}`);
                        }
                    }
                } else {
                    // Jika tidak dapat parsing data JSON, tangani sesuai kebutuhan
                    console.log("Invalid JSON data received:", event.data);
                }
            };

            // Menangani error WebSocket
            ws.onerror = function (error) {
                console.error('WebSocket error:', error);
            };
        }
	});
});