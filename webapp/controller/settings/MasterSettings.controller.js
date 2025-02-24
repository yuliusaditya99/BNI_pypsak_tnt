sap.ui.define([
	'sap/ui/bni/toolpageapp/controller/BaseController',
	'sap/m/MessageToast',
	'sap/ui/model/json/JSONModel',
	'sap/ui/bni/toolpageapp/model/formatter',
	'sap/ui/core/date/UI5Date',
	"sap/ui/bni/toolpageapp/util/Config",
	"../Config.API"
], function (BaseController, MessageToast, JSONModel, formatter, UI5Date, Config, ConfigAPI) {
	"use strict";
	return BaseController.extend("sap.ui.bni.toolpageapp.controller.settings.MasterSettings", {
		
		formatter: formatter,
		

		onInit: function () {
			var oViewModel = new JSONModel({
					currentUser: "Administrator",
					lastLogin: UI5Date.getInstance(Date.now() - 86400000)
				});

			var oDialogModel = new JSONModel({});
			this.setModel(oDialogModel, "dialogModel");

			this.appConfig = new ConfigAPI();

			this.appConfig = new ConfigAPI();

			this.setModel(oViewModel, "view");
			console.log("masuk");
			var sViewId = this.getView().getId();
			console.log("key view : ",sViewId);
            if (sViewId.includes("userManagement")) {
                this._setupUserManagement();
            } 
			else if (sViewId.includes("detailSettings")) {
                this._initializeAsyncData();            
			} 
			else if (sViewId.includes("logManagement")) {
				this._setupLogManagement();
			}
			else if (sViewId.includes("branchOffice")){
				this._setupBranchOffice();
			}
			else if (sViewId.includes("roleManagement")) {
				console.log("Masuk role management");
				this._setupRoleManagement();
			}
			
			
		},

		_initializeAsyncData: async function () {
			
			this._selectedColumn = "fileName";			
			try {
			  
			  console.log("Set Header 1:", axios.defaults.headers.common["Authorization"]);
			  this.onGetData(10,"File");
			} catch (error) {
			  if (error.response) {
				console.error("Error Response:", error.response.data);
				console.error("Status:", error.response.status);
			  } else if (error.request) {
				console.error("Error Request:", error.request);
			  } else {
				console.error("Error Message:", error.message);
			  }
			}
			
		},

		_loadProcessData: async function () {
			this._selectedColumn = "clientCode";
            // const clientResponse = await axios.get(Config.paths.apiBaseUrl +'/api/client?start=0&length=100000000&orders=id&dirs=desc');
			// const roleResponse = await axios.get(Config.paths.apiBaseUrl +'/api/role?start=0&length=100000000&orders=id&dirs=desc');

			const header = {  "Content-Type": "application/json" };
			const params = { start: 0, length: 100000000, orders:"id", dirs:"desc" };

			const clientResponse = await this.appConfig.allAPI("get", header, params, Config.paths.apiBaseUrl +'/api/client');
			if (clientResponse == "Token expired" ) { 
					// MessageToast.show("Token expired.", { duration: 3000 });                   
					// const oView = this.getView();
					// const oComponent = sap.ui.core.Component.getOwnerComponentFor(oView);
					// const oRouter = oComponent.getRouter();
					// console.log("Router:", oRouter);
					// oRouter.navTo("login");		
					MessageToast.show("Token expired.", { duration: 3000 });			
					var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
					this.appConfig.logout(oRouter);
					
				}
			const roleResponse = await this.appConfig.allAPI("get", header, params, Config.paths.apiBaseUrl +'/api/role');
			if (roleResponse == "Token expired" ) { 
					// MessageToast.show("Token expired.", { duration: 3000 });                   
					// const oView = this.getView();
					// const oComponent = sap.ui.core.Component.getOwnerComponentFor(oView);
					// const oRouter = oComponent.getRouter();
					// console.log("Router:", oRouter);
					// oRouter.navTo("login");
					MessageToast.show("Token expired.", { duration: 3000 });			
					var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
					this.appConfig.logout(oRouter);
				}
			console.log("clientResponse : ",clientResponse);
 
            const cleintTableData = clientResponse.payloads.data;
			//
            const roleTableData = roleResponse.payloads.data;
        
        
            const clients = cleintTableData.map(client => ({
              clientCode: client.code
            }));
            console.log("Clients:", clients);

			const roles = roleTableData.map(role => ({
				idRoles: role.id,
				rolesName: role.name,
			  }));
			console.log("Roles loda proces data:", roles);
        
            const oViewModel = this.getModel("view");
            if (oViewModel) {
              oViewModel.setProperty("/clients", clients);
			  oViewModel.setProperty("/roles", roles);
            } else {
              console.error("View model not found.");
            }
        },

		_setupLogManagement: async function () {
			this._selectedColumn = "timestamp";
			try {
				//console.log("Masuk Cont Log Management");
				//console.log("Set Header 1:", axios.defaults.headers.common["Authorization"]);
				var oLogModel = this.getOwnerComponent().getModel("logModel");
			} catch (error) {
				if (error.response) {
					console.error("Error Response:", error.response.data);
					console.error("Status:", error.response.status);
				} else if (error.request) {
					console.error("Error Request:", error.request);
				} else {
					console.error("Error Message:", error.message);
				}
			}
			
		},
		
		_setupBranchOffice: async function () {
			this._selectedColumn = "code";
			//this.getView().getModel("view").setProperty("/showRolesId", false);
			try {
			  console.log("Masuk Branch Office");
			  console.log("Set Header 1:", axios.defaults.headers.common["Authorization"]);
			  this.onGetData(10,"Branch");
			} catch (error) {
			  if (error.response) {
				console.error("Error Response:", error.response.data);
				console.error("Status:", error.response.status);
			  } else if (error.request) {
				console.error("Error Request:", error.request);
			  } else {
				console.error("Error Message:", error.message);
			  }
			}
			
		},

		_setupUserManagement: async function () {
			this._selectedColumn = "clientCode";
			this.getView().getModel("view").setProperty("/showRolesId", false);
			try {
			  console.log("Masuk User Management");
			  console.log("Set Header 1:", axios.defaults.headers.common["Authorization"]);
			  this.onGetData(10,"User");
			} catch (error) {
			  if (error.response) {
				console.error("Error Response:", error.response.data);
				console.error("Status:", error.response.status);
			  } else if (error.request) {
				console.error("Error Request:", error.request);
			  } else {
				console.error("Error Message:", error.message);
			  }
			}
			
		},

		_setupRoleManagement: async function () {
			console.log("masuk setup role management");
			this._selectedColumn = "name";
			this.getView().getModel("view").setProperty("/showRolesId", false);
			console.log("get model view:", this.getModel("view"));
			try {
			  console.log("Masuk Role Management");
			  console.log("Set Header 1:", axios.defaults.headers.common["Authorization"]);
			  this.onGetData(10,"Role");
			} catch (error) {
			  if (error.response) {
				console.error("Error Response:", error.response.data);
				console.error("Status:", error.response.status);
			  } else if (error.request) {
				console.error("Error Request:", error.request);
			  } else {
				console.error("Error Message:", error.message);
			  }
			}
		},
		

		onGetData: async function(paramLength, navactive) {

            try {
				console.log("Masuk onGetData");
			  
				let pageCount;
				let totalRowCount;
				let params;
				let dataResponse;
				const header = {  "Content-Type": "application/json" };
                console.log("paramLength : ",paramLength);
				console.log("navactive : ",navactive);
				console.log("navactive : ",navactive);
				if(navactive == "User")
				{
					if(paramLength == "-1")
					{
						console.log("masuk -1");
						//dataResponse = await axios.get(Config.paths.apiBaseUrl +'/api/user?start=0&length=10&orders=id&dirs=desc');
						params = { start: 0, length: 100000000, orders:"id", dirs:"desc" };
					
					}
					else
					{
						//dataResponse = await axios.get(Config.paths.apiBaseUrl +'/api/user?start=0&length='+paramLength+'&orders=id&dirs=desc');
						params = { start: 0, length: paramLength, orders:"id", dirs:"desc" };						
					}
					dataResponse = await this.appConfig.allAPI("get", header, params, Config.paths.apiBaseUrl +'/api/user');
					if (dataResponse == "Token expired" ) {
						// MessageToast.show("Token expired.", { duration: 3000 });                   
						// const oView = this.getView();
						// const oComponent = sap.ui.core.Component.getOwnerComponentFor(oView);
						// const oRouter = oComponent.getRouter();
						// console.log("Router:", oRouter);
						// oRouter.navTo("login");                     
						//return; // Hentikan eksekusi jika token expired
						MessageToast.show("Token expired.", { duration: 3000 });			
						var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
						this.appConfig.logout(oRouter);
						}

					console.log("dataResponse User : ",dataResponse);
			
					// const usertableData = dataResponse.payloads.data;
					// pageCount = dataResponse.payloads.per_page;
					// totalRowCount = dataResponse.payloads.total;
			
					const usertableData = dataResponse.payloads.data;
					pageCount = dataResponse.payloads.per_page;
					totalRowCount = dataResponse.payloads.total;
					const users = usertableData.map(user => ({
						id: user.id,
						clientCode: user.client_code,
						username: user.user_name,
						fullname: user.full_name,
						division: user.division,
						email: user.email,
						password: user.password,
						passwordStartAt: user.password_start_at,
						online: user.online,
						status: user.status,
						roles: Array.isArray(user.roles) 
							? user.roles.map(role => role.pivot_role.name).join(", ") : "N/A", 
						idRoles: Array.isArray(user.roles) 
							? user.roles.map(role => role.role_id).join(", ") : "N/A",
						loginAt: user.login_at,
						logoutAt: user.logout_at,
						resetAt: user.reset_at,
						createdBy: user.createdBy?.user_name || "N/A",
						createdAt: user.created_at,
						updatedBy: user.updated_by,
						updatedAt: user.updated_at				
					}));
					console.log("Users:", users);
				
					const oViewModel = this.getModel("view");
					if (oViewModel) {
						oViewModel.setProperty("/users", users);
					} else {
						console.error("View model not found.");
					}
				}
				else if (navactive == "Branch")
				{
					if(paramLength == "-1")
					{
						console.log("masuk -1");
						//dataResponse = await axios.get(Config.paths.apiBaseUrl +'/api/user?start=0&length=10&orders=id&dirs=desc');
						params = { start: 0, length: 100000000, orders:"id", dirs:"desc" };
					}
					else
					{
						//dataResponse = await axios.get(Config.paths.apiBaseUrl +'/api/user?start=0&length='+paramLength+'&orders=id&dirs=desc');
						params = { start: 0, length: paramLength, orders:"id", dirs:"desc" };						
					}
					dataResponse = await this.appConfig.allAPI("get", header, params, Config.paths.apiBaseUrl +'/api/client');
					if (dataResponse == "Token expired" ) { 
						// MessageToast.show("Token expired.", { duration: 3000 });                   
						// const oView = this.getView();
						// const oComponent = sap.ui.core.Component.getOwnerComponentFor(oView);
						// const oRouter = oComponent.getRouter();
						// console.log("Router:", oRouter);
						// oRouter.navTo("login");
						MessageToast.show("Token expired.", { duration: 3000 });			
						var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
						this.appConfig.logout(oRouter);
					}

					console.log("dataResponse Branch : ",dataResponse);
			
					const branchtableData = dataResponse.payloads.data;
					pageCount = dataResponse.payloads.per_page;
					totalRowCount = dataResponse.payloads.total;
					const branch = branchtableData.map(branch => ({
						id: branch.id,
						code: branch.code,
						name: branch.name,
						createdBy: branch.createdBy?.user_name || "N/A",
						createdAt: branch.created_at,
						updatedBy: branch.updated_by,
						updatedAt: branch.updated_at,
						deletedAt: branch.deleted_at	
						
					}));
					console.log("branch:", branch);
				
					const oViewModel = this.getModel("view");
					if (oViewModel) {
						oViewModel.setProperty("/branch", branch);
					} else {
						console.error("View model not found.");
					}
				}
				else if (navactive == "Role") {

					// if (paramLength == "-1") {
					// 	console.log("masuk -1 role");
					// 	dataResponse = await axios.get(Config.paths.apiBaseUrl + '/api/role?start=0&length=100000000&orders=id&dirs=desc');
					// } else {
					// 	dataResponse = await axios.get(Config.paths.apiBaseUrl + '/api/role?start=0&length=' + paramLength + '&orders=id&dirs=desc');
					// }
					if(paramLength == "-1")
					{
						console.log("masuk -1");
						//dataResponse = await axios.get(Config.paths.apiBaseUrl +'/api/user?start=0&length=10&orders=id&dirs=desc');
						params = { start: 0, length: 100000000, orders:"id", dirs:"desc" };
					}
					else
					{
						//dataResponse = await axios.get(Config.paths.apiBaseUrl +'/api/user?start=0&length='+paramLength+'&orders=id&dirs=desc');
						params = { start: 0, length: paramLength, orders:"id", dirs:"desc" };						
					}
					dataResponse = await this.appConfig.allAPI("get", header, params, Config.paths.apiBaseUrl +'/api/role');
					console.log("dataResponse 1:", dataResponse);
					if (dataResponse == "Token expired" ) { 
						// MessageToast.show("Token expired.", { duration: 3000 });                   
						// const oView = this.getView();
						// const oComponent = sap.ui.core.Component.getOwnerComponentFor(oView);
						// const oRouter = oComponent.getRouter();
						// console.log("Router:", oRouter);
						// oRouter.navTo("login");
						console.log("dataResponse 2:", dataResponse);
						MessageToast.show("Token expired.", { duration: 3000 });			
						var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
						this.appConfig.logout(oRouter);
					}
					
					console.log("dataResponse Role:", dataResponse);
					console.log("Roles:", dataResponse.payloads.data);

					const roleData = dataResponse.payloads.data;
					console.log("Role Data:", roleData);
					const roles = roleData.map(role => ({
						id: role.id,
						name: role.name,
						createdBy: role.createdBy.user_name,
						createdAt: role.created_at,
						updatedBy: role.updatedBy ? role.updatedBy.user_name : "N/A",
						updatedAt: role.updated_at || "N/A",
						permissions: role.permissions.map(perm => ({
							moduleName: perm.pivot_permission.name,
							permission: perm.is_write ? "Read/Write" : "Read",
							permissionId: perm.pivot_permission.id,
							is_write: perm.is_write
						})),
						moduleName: role.permissions.map(perm => perm.pivot_permission.name).join('\n'),
						permission: role.permissions.map(perm => (perm.is_write ? "Read/Write" : "Read")).join('\n')
					}));
				
					
				
					const oViewModel = this.getModel("view");
					if (oViewModel) {
						oViewModel.setProperty("/roles", roles);
					} else {
						console.error("View model not found.");
					}
				}
				else
				{
					console.log("masuk file");
					if(paramLength == "-1")
					{
						console.log("masuk -1");
						//dataResponse = await axios.get(Config.paths.apiBaseUrl +'/api/file?start=0&length=100000000&orders=id&dirs=desc');
						params = { start: 0, length: 100000000, orders:"id", dirs:"desc" };
					}
					else
					{
						//dataResponse = await axios.get(Config.paths.apiBaseUrl +'/api/file?start=0&length='+paramLength+'&orders=id&dirs=desc');
						params = { start: 0, length: paramLength, orders:"id", dirs:"desc" };	
					}

					dataResponse = await this.appConfig.allAPI("get", header, params, Config.paths.apiBaseUrl +'/api/file');
					if (dataResponse == "Token expired" ) { 
						// MessageToast.show("Token expired.", { duration: 3000 });                   
						// const oView = this.getView();
						// const oComponent = sap.ui.core.Component.getOwnerComponentFor(oView);
						// const oRouter = oComponent.getRouter();
						// console.log("Router:", oRouter);
						// oRouter.navTo("login");                     
						//return; // Hentikan eksekusi jika token expired
						MessageToast.show("Token expired.", { duration: 3000 });			
						var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
						this.appConfig.logout(oRouter);
					}
					console.log("dataResponse :",dataResponse);

					const filetableData = dataResponse.payloads.data;
					pageCount = dataResponse.payloads.per_page;
					totalRowCount = dataResponse.payloads.total;
				
					const files = filetableData.map(file => ({
						id: file.id,
						fileName: file.file_name,
						path: file.path,
						contentType: file.content_type,
						extension: file.extension,
						createdAt: file.created_at,
						createdBy: file.createdBy?.user_name || "N/A",
						size: file.size_bytes,
					}));
					console.log("Files:", files);
				
					// Langkah 3: Tambahkan data ke model "view"
					const oViewModel = this.getModel("view");
					if (oViewModel) {
						oViewModel.setProperty("/files", files);
					} else {
						console.error("View model not found.");
					}
				}
				

                return {
                    perpage : pageCount,
                    totalrow: totalRowCount
                };
            } catch (error) {
                if (error.response) {
                    console.error("Error Response:", error.response.data);
                    console.error("Status:", error.response.status);
                } else if (error.request) {
                    console.error("Error Request:", error.request);
                } else {
                    console.error("Error Message:", error.message);
                }
            }
            
        },
		// const response = await axios.get(`${Config.paths.apiBaseUrl}/api/permission?start=0&length=100000000&orders=id&dirs=desc`);
		onGetPermissions: async function () {
			try {
				const response = await axios.get(`${Config.paths.apiBaseUrl}/api/permission?start=0&length=100000000&orders=id&dirs=desc`);
				console.log("Permissions Response:", response.data); // Ensure correct logging
		
				if (response.data?.payloads?.data && Array.isArray(response.data.payloads.data)) {
					const permissions = response.data.payloads.data.map(perm => ({
						id: perm.id,
						name: perm.name
					}));
					console.log("Permissions on onGetPermissions:", permissions);
					const oViewModel = this.getModel("view");
					if (oViewModel) {
						oViewModel.setProperty("/permissions", permissions);
					} else {
						console.error("View model not found.");
					}
				} else {
					console.warn("Unexpected permissions data structure:", response.data);
				}
			} catch (error) {
				console.error("Failed to load permissions:", error);
			}
		},		

		onMasterPressed: function (oEvent) {
			var oContext = oEvent.getParameter("listItem").getBindingContext("side");
			var sPath = oContext.getPath() + "/selected";
			oContext.getModel().setProperty(sPath, true);
			var sKey = oContext.getProperty("key");
			console.log("sKey : ",sKey);
			switch (sKey) {
				case "processDefinitions": {
					this.getRouter().navTo(sKey);
					break;
				}
				case "userManagement": {
					this.getRouter().navTo(sKey);
					break;
				}
				case "logManagement": {
					this.getRouter().navTo(sKey);
					break;
				}
				case "branchOffice": {
					this.getRouter().navTo(sKey);
					break;
				}
				case "roleManagement": {
					this.getRouter().navTo(sKey);
					break;
				}
				default: {
					this.getBundleText(oContext.getProperty("titleI18nKey")).then(function(sMasterElementText){
						this.getBundleText("clickHandlerMessage", [sMasterElementText]).then(function(sMessageText){
							MessageToast.show(sMessageText);
						});
					}.bind(this));
					break;
				}
			}
		},

		onSavePressed: function (oEvent) {
			this.onGeneralButtonPress(oEvent);
		},

		onCancelPressed: function (oEvent) {
			this.onGeneralButtonPress(oEvent);
		},

		onGeneralButtonPress: function(oEvent){
			var sButtonText = oEvent.getSource().getText();
			this.getBundleText("clickHandlerMessage", [sButtonText]).then(function(sMessageText){
				MessageToast.show(sMessageText);
			});
		},

		onConfirmRolesSelection: function () {
			const oMultiComboBox = this.byId("rolesUNCombo");
			const selectedKeys = oMultiComboBox.getSelectedKeys(); // Ambil semua key yang dipilih
		
			// Simpan ke model dialog
			this.getModel("dialogModel").setProperty("/roles", selectedKeys);
		
			// Anda bisa mengambil nama roles yang dipilih jika perlu
			const selectedRoles = selectedKeys.map(key => {
				const allRoles = this.getModel("view").getProperty("/users");
				return allRoles.find(role => role.idRoles === key)?.roles || "Unknown";
			});
		
			console.log("Selected Roles:", selectedRoles); // Menampilkan roles yang dipilih
		
			// Tutup dialog
			this._oRolesDialog.close();
		},

		onSaveDialogUser: async function () {
			console.log("onSaveDialogUser");
		
			const usernameValue = this.byId("usernameUNInput") ? this.byId("usernameUNInput").getValue() : "";
			const fullnameValue = this.byId("fullnameUNInput") ? this.byId("fullnameUNInput").getValue() : "";
			const emailValue = this.byId("emailUNInput") ? this.byId("emailUNInput").getValue() : "";
			const clientCodeValue = this.byId("branchCodeUNCombo") ? this.byId("branchCodeUNCombo").getValue() : "";
			const rolesValue = this.byId("rolesUNCombo") ? this.byId("rolesUNCombo").getSelectedKeys().filter(key => key !== "") : [];
			console.log("usernameValue :", usernameValue);
			console.log("fullnameValue :", fullnameValue);
			console.log("emailValue :", emailValue);
			console.log("clientCodeValue :", clientCodeValue);
			console.log("rolesValue :", rolesValue);
			let flagDone = 0;
			const oDialog = this.byId("UserDialog");
			const oDialogModel = this.getView().getModel("dialogModel");

		
			if (!usernameValue) {
                oDialogModel.setProperty("/usernameState", "Error");
                oDialogModel.setProperty("/usernameErrorText", "Username is required!");
				flagDone = 1;
            }
			else
			{
				if(usernameValue.length < 5){					
					oDialogModel.setProperty("/usernameState", "Error");
					oDialogModel.setProperty("/usernameErrorText", "Ensure this value has at least 5 characters");
					flagDone = 1;
				}
            }

            if (!fullnameValue) {
                oDialogModel.setProperty("/fullnameState", "Error");
                oDialogModel.setProperty("/fullnameErrorText", "Fullname is required!");
				flagDone = 1;
            }
			else
			{
				if(fullnameValue.length < 5){					
					oDialogModel.setProperty("/fullnameState", "Error");
					oDialogModel.setProperty("/fullnameErrorText", "Ensure this value has at least 5 characters");
					flagDone = 1;
				}  
			}         
            if (!emailValue) {
                oDialogModel.setProperty("/emailState", "Error");
                oDialogModel.setProperty("/emailErrorText", "Email is required!");
				flagDone = 1;
            }
			else
			{
				if (!this.isValidEmail(emailValue)) {
					oDialogModel.setProperty("/emailState", "Error");
					oDialogModel.setProperty("/emailErrorText", "Invalid email format!");
					flagDone = 1;
				}
			}
			if (!clientCodeValue) {
                oDialogModel.setProperty("/clientState", "Error");
                oDialogModel.setProperty("/clientErrorText", "Client is required!");
				flagDone = 1;
            }              
			if (rolesValue.length === 0) {
                oDialogModel.setProperty("/rolesState", "Error");
                oDialogModel.setProperty("/rolesErrorText", "Role is required!");
				flagDone = 1;
            }
            if(flagDone==0)
            {
				try {						
						console.log("oDialogModel : ",oDialogModel);
						console.log("oDialogModel data : ",oDialogModel.getData());
						const oDialogData = oDialogModel ? oDialogModel.getData() : {};
						const idUser = oDialogData.id || null;
						let payload;	
						const headers = {  "Content-Type": "application/json" };						
						//sap.ui.core.BusyIndicator.show(0);
						console.log("idUser:", idUser);	
						let oResponse;
						if (idUser) {
							payload = {
										payload: {
													user_name: usernameValue,
													full_name: fullnameValue,
													email: emailValue,
													client_code: clientCodeValue,
													id: idUser
												},
												relation: {
													roles: rolesValue.map(roleId => ({ id: parseInt(roleId, 10) }))
												}
											};
			
							console.log("Payload to send:", payload);	
							console.log("Editing user with ID:", idUser);
		
							oResponse = await this.appConfig.allAPI("put", headers, payload, `${Config.paths.apiBaseUrl}/api/user/${idUser}`);
							if (oResponse == "Token expired" ) { 
								// MessageToast.show("Token expired.", { duration: 3000 });                   
								// const oView = this.getView();
								// 		const oComponent = sap.ui.core.Component.getOwnerComponentFor(oView);
								// 		const oRouter = oComponent.getRouter();
								// 		console.log("Router:", oRouter);
								// 		oRouter.navTo("login"); 
									MessageToast.show("Token expired.", { duration: 3000 });			
									var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
									this.appConfig.logout(oRouter);                    
								}
					} 
					else {
						// Create new data
						console.log("Creating new user");
						payload = {
							payload: {
										user_name: usernameValue,
										full_name: fullnameValue,
										email: emailValue,
										client_code: clientCodeValue
									},
									relation: {
										roles: rolesValue.map(roleId => ({ id: parseInt(roleId, 10) }))
									}
								};			

						oResponse = await this.appConfig.allAPI("post", headers, payload, `${Config.paths.apiBaseUrl}/api/user`);
						if (oResponse == "Token expired" ) { 
								// MessageToast.show("Token expired.", { duration: 3000 });                   
								// const oView = this.getView();
								// const oComponent = sap.ui.core.Component.getOwnerComponentFor(oView);
								// const oRouter = oComponent.getRouter();
								// console.log("Router:", oRouter);
								// oRouter.navTo("login");
								MessageToast.show("Token expired.", { duration: 3000 });			
								var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
								this.appConfig.logout(oRouter);
							}
					}
					console.log("oResponse Edit: ",oResponse);
			
					if (oResponse.error) {
						MessageToast.show("Failed to save user: " + oResponse.message);
					} else {
						MessageToast.show("User saved successfully.");
						console.log("API Response:", oResponse.data);
					}
			
					oDialog.close();
					this.onRefresh(); 
			
				} catch (oError) {
					console.error("Error response:", oError.response);
					if (oError.response) {
						console.error("Error status:", oError.response.status);
						console.error("Error data:", oError.response.data);
						console.error("Error msg:", oError.response.data.detail[0].msg);
						console.error("Error message:", oError.response.data.message || oError.response.statusText);
						MessageToast.show("Error: " + oError.response.data.detail[0].msg, { duration: 3000 });
					} else {
						console.error("Unexpected error:", oError);
						MessageToast.show("An unexpected error occurred.", { duration: 3000 });
					}
				} 
			}
			else
			{
				return;
			}
		},

		onSaveDialogBranch: async function () {
			console.log("onSaveDialogBranch");
		
			const codeValue = this.byId("codeInput") ? this.byId("codeInput").getValue() : "";
			const nameValue = this.byId("nameInput") ? this.byId("nameInput").getValue() : "";
			// console.log("codeValue :", codeValue);
			// console.log("nameValue :", nameValue);
			const oDialog = this.byId("BranchDialog");
			const oDialogModel = this.getView().getModel("dialogModel");

			if (!codeValue) {
                oDialogModel.setProperty("/codeState", "Error");
                oDialogModel.setProperty("/codeErrorText", "Code is required!");
            }
			if (!nameValue){
				oDialogModel.setProperty("/nameState", "Error");
                oDialogModel.setProperty("/nameErrorText", "Name is required!");
			}

			if(codeValue && nameValue)
			{
				try {			
					
					console.log("oDialogModel : ",oDialogModel);
					console.log("oDialogModel data : ",oDialogModel.getData());
					const oDialogData = oDialogModel ? oDialogModel.getData() : {};
					const idBranch = oDialogData.id || null;
					let payload;
	
					const headers = {  "Content-Type": "application/json" };
			
						
					//sap.ui.core.BusyIndicator.show(0);
					console.log("idBranch:", idBranch);	
					let oResponse;
					if (idBranch) {
						payload = {
									code: codeValue,
									name: nameValue,
									id: idBranch
									};
		
						console.log("Payload to send:", payload);	
		
						oResponse = await this.appConfig.allAPI("put", headers, payload, `${Config.paths.apiBaseUrl}/api/client/${idBranch}`);
						if (oResponse == "Token expired" ) { 
								// MessageToast.show("Token expired.", { duration: 3000 });                   
								// const oView = this.getView();
								// const oComponent = sap.ui.core.Component.getOwnerComponentFor(oView);
								// const oRouter = oComponent.getRouter();
								// console.log("Router:", oRouter);
								// oRouter.navTo("login");
								MessageToast.show("Token expired.", { duration: 3000 });			
								var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
								this.appConfig.logout(oRouter);
							}
					} else {
						// Create new data
						console.log("Creating new Branch");
						payload = {
									code: codeValue,
									name: nameValue
									};
	
						oResponse = await this.appConfig.allAPI("post", headers, payload, `${Config.paths.apiBaseUrl}/api/client`);
						if (oResponse == "Token expired" ) { 
								// MessageToast.show("Token expired.", { duration: 3000 });                   
								// const oView = this.getView();
								// 		const oComponent = sap.ui.core.Component.getOwnerComponentFor(oView);
								// 		const oRouter = oComponent.getRouter();
								// 		console.log("Router:", oRouter);
								// 		oRouter.navTo("login");
								MessageToast.show("Token expired.", { duration: 3000 });			
								var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
								this.appConfig.logout(oRouter);
							}
					}
					console.log("oResponse Edit: ",oResponse);
			
					if (oResponse.error) {
						MessageToast.show("Failed to save user: " + oResponse.message);
					} else {
						MessageToast.show("User saved successfully.");
						console.log("API Response:", oResponse.data);
					}
			
					oDialog.close();
					this.onRefresh(); // Refresh data setelah simpan
			
				} catch (oError) {
					console.error("Error response:", oError.response);// Menangani error
					if (oError.response) {
						console.error("Error status:", oError.response.status);
						console.error("Error data:", oError.response.data);
						console.error("Error msg:", oError.response.data.detail[0].msg);
						console.error("Error message:", oError.response.data.message || oError.response.statusText);
						MessageToast.show("Error: " + oError.response.data.detail[0].msg, { duration: 3000 });
					} else {
						console.error("Unexpected error:", oError);
						MessageToast.show("An unexpected error occurred.", { duration: 3000 });
					}
				} 
			}
			else
			{
				return;
			}
			//sap.ui.core.BusyIndicator.hide();			
		},

        onCancelDialogUser: function () {
			this.getView().byId("UserDialog").close();
        },

		onCancelDialogBranch: function () {
			this.getView().byId("BranchDialog").close();
        },

		onCancelDialogBranch: function () {
			this.getView().byId("BranchDialog").close();
        },

		onNavButtonPress: function  () {
			this.getOwnerComponent().myNavBack();
		},

		
		onRowCountChange: async function (oEvent) {
			var sViewId = this.getView().getId();
			console.log("Masuk onRowCountChange");
			const sSelectedKey = oEvent.getSource().getSelectedKey();
            if (sViewId.includes("userManagement")) {                
				const oTable = this.byId("TableUser");
				const result = await this.onGetData(sSelectedKey,"User");
				countPerPage = result.perpage;
				countTotal = result.tasks;
				console.log("countTotal : ", countTotal);
				console.log("countPerPage : ", countPerPage);
            } else if (sViewId.includes("detailSettings")) {
				const oTable = this.byId("TableUpload");
				const result = await this.onGetData(sSelectedKey,"File");
				countPerPage = result.perpage;
				countTotal = result.tasks;
				console.log("countTotal : ", countTotal);
				console.log("countPerPage : ", countPerPage);
			} else if (sViewId.includes("logManagement")) {
				const oTable = this.byId("TableLogManagement");
				const result = await this.onGetData(sSelectedKey,"Log");
				countPerPage = result.perpage;
				countTotal = result.tasks;
				console.log("countTotal : ", countTotal);
				console.log("countPerPage : ", countPerPage);
            } else if (sViewId.includes("branchOffice")) {
				const oTable = this.byId("TableClient");
				const result = await this.onGetData(sSelectedKey,"Branch");
				countPerPage = result.perpage;
				countTotal = result.tasks;
				console.log("countTotal : ", countTotal);
				console.log("countPerPage : ", countPerPage);
			} else if (sViewId.includes("logManagement")) {
				const oTable = this.byId("TableLogManagement");
				const result = await this.onGetData(sSelectedKey,"Log");
				countPerPage = result.perpage;
				countTotal = result.tasks;
				console.log("countTotal : ", countTotal);
				console.log("countPerPage : ", countPerPage);
            } else if (sViewId.includes("branchOffice")) {
				const oTable = this.byId("TableClient");
				const result = await this.onGetData(sSelectedKey,"Branch");
				countPerPage = result.perpage;
				countTotal = result.tasks;
				console.log("countTotal : ", countTotal);
				console.log("countPerPage : ", countPerPage);
            } else if (sViewId.includes("roleManagement")) {
				const oTable = this.byId("TableRole");
				const result = await this.onGetData(sSelectedKey,"Role");
				countPerPage = result.perpage;
				countTotal = result.tasks;
				console.log("countTotal : ", countTotal);
				console.log("countPerPage : ", countPerPage);
			}         
        },

		onSaveDialogRole: async function () {
			console.log("onSaveDialogRole");
			const oDialog = this.byId("RoleDialog");
			const oDialogModel = this.getView().getModel("dialogModel");

			const roleName = this.byId("roleNameInput") ? this.byId("roleNameInput").getValue() : "";
			const permissionsValue = this.byId("permissionsMultiCombo") 
				? this.byId("permissionsMultiCombo").getSelectedKeys().filter(key => key !== "") 
				: [];
		
			console.log("roleName:", roleName);
			console.log("permissionsValue:", permissionsValue);
		
			let isValid = true;

			// Validate role name
			if (!roleName) {
				oDialogModel.setProperty("/nameState", "Error");
				oDialogModel.setProperty("/nameErrorText", "Role Name is required!");
				isValid = false;
			} else {
				oDialogModel.setProperty("/nameState", "None"); // Reset error state
				oDialogModel.setProperty("/nameErrorText", "");
			}
		
			// Validate permissions selection
			if (permissionsValue.length === 0) {
				oDialogModel.setProperty("/permissionsState", "Error");
				oDialogModel.setProperty("/permissionsErrorText", "Select at least one permission!");
				isValid = false;
			} else {
				oDialogModel.setProperty("/permissionsState", "None"); // Reset error state
				oDialogModel.setProperty("/permissionsErrorText", "");
			}
		
			// Stop execution if validation fails
			if (!isValid) {
				MessageToast.show("Please fix the errors before saving.");
				return;
			}

			let oResponse;
			
			try {
				// const oDialog = this.byId("RoleDialog");
				// const oDialogModel = this.getView().getModel("dialogModel");
				console.log("oDialogModel:", oDialogModel);
				console.log("oDialogModel data:", oDialogModel.getData());
		
				const oDialogData = oDialogModel ? oDialogModel.getData() : {};
				const idRole = oDialogData.idRole || null;
		
				let payload;
				//sap.ui.core.BusyIndicator.show(0);
				console.log("idRole:", idRole);

				// Get permissions array from dialogModel
				const aPermissions = oDialogModel.getProperty("/permissions") || [];
				const permissionsPayload = permissionsValue.map((permissionId, index) => {
					return {
						id: parseInt(permissionId, 10), // Convert ID to integer
						is_write: aPermissions[index]?.is_write ?? false // Default to false if undefined
					};
				});
				
		
				if (idRole) {
					// Update existing role
					payload = {
						payload: {
							name: roleName,
							id: idRole
						},
						relation: {
							permissions: permissionsPayload
						}
					};
		
					console.log("Payload to send (Update):", payload);
					console.log("Editing role with ID:", idRole);
		
					oResponse = await axios.put(`${Config.paths.apiBaseUrl}/api/role/${idRole}`, payload, {
					    headers: { "Content-Type": "application/json" }
					});
				} else {
					// Create new role
					payload = {
						payload: {
							name: roleName
						},
						relation: {
							permissions: permissionsPayload
						}
					};
		
					console.log("Payload to send (Create):", payload);
					oResponse = await axios.post(`${Config.paths.apiBaseUrl}/api/role`, payload, {
					    headers: { "Content-Type": "application/json" }
					});
				}
		
				console.log("oResponse:", oResponse);
				if (oResponse?.data?.error) {
					MessageToast.show("Failed to save role: " + oResponse.data.message);
				} else {
					MessageToast.show("Role saved successfully.");
					console.log("API Response:", oResponse?.data);
				}
				
				// Reset all 'is_write' checkboxes to false before closing
				aPermissions.forEach(permission => {
					permission.is_write = false;
				});
				oDialogModel.setProperty("/permissions", aPermissions);
		
				oDialog.close();
				this.onRefresh();
		
			} catch (Error) {
				console.error("Caught an error:", Error);
				
				if (Error.response) {
					console.error("Error response:", Error.response);
					console.error("Error status:", Error.response.status);
					console.error("Error data:", Error.response.data);
					console.error("Error message:", Error.response.data?.message || Error.response.statusText);
					MessageToast.show("Error: " + (Error.response.data?.message || "Unknown error"), { duration: 3000 });
				} else {
					console.error("Unexpected error (no response from server):", Error);
					MessageToast.show("An unexpected error occurred. Please check the console.", { duration: 3000 });
				}
			} 
		},
		
		
		onCancelDialogRole: function () {
			console.log("Cancel Role Creation");
			this.byId("RoleDialog").close();
			this.onRefresh();
		},
		
		onSelectAllPermission: function (oEvent) {
			let oDialogModel = this.getView().getModel("dialogModel");
			let aPermissions = oDialogModel.getProperty("/permissions");
		
			// Get the state of the "Select All" checkbox
			let bSelected = oEvent.getParameter("selected");
		
			// Update the is_write property for all permissions
			aPermissions.forEach(permission => {
				permission.is_write = bSelected;
			});
		
			// Refresh the model to update the table
			oDialogModel.refresh();
		},
		
		// onSelectAll: function (oEvent) {
		// 	var bSelected = oEvent.getSource().getSelected();
		// 	var aFiles = this.getView().getModel("view").getProperty("/files");
		
		// 	aFiles.forEach(function (file) {
		// 		file.selected = bSelected;
		// 	});
		
		// 	this.getView().getModel("view").refresh();
		// },

		// onNew: function () {
        //     // Buka dialog
        //     var oView = this.getView();
        //     var oDialog = oView.byId("excelUploadDialog");

        //     if (!oDialog) {
        //         oDialog = sap.ui.xmlfragment(oView.getId(), "sap.ui.bni.toolpageapp.view.fragments.ExcelUploadDialog", this);
        //         oView.addDependent(oDialog);
        //     }
        //     oDialog.open();
        // },

		//#region add new

		onNew: function () {
			var sViewId = this.getView().getId();
		
			if (sViewId.includes("userManagement")) {
				const dialogModel = this.getView().getModel("dialogModel");
				console.log("Open User Dialog");
		
				// Initialize dialog model with empty values
				dialogModel.setData({
					title: "",
					date: "",
					processDefinition: "",
					description: "",
					clientCode: "",
					username: "",
					fullname: "",
					division: "",
					email: "",
					password: "",
					passwordStartAt: "",
					online: "",
					status: "",
					roles: "",
					idRoles: "",
					LoginAt: "",
					LogoutAt: "",
					ResetAt: "",
					CreatedBy: "",
					CreatedAt: "",
					UpdatedBy: "",
					UpdatedAt: ""
				});
		
				this._loadProcessData();
				this._openDialogUser(); 
            } else if (sViewId.includes("detailSettings")) {
				this._openDialogFile();		
			} else if (sViewId.includes("branchOffice")){
				const dialogModel = this.getView().getModel("dialogModel");
				dialogModel.setData({
					code: "",
					name: ""
				});
				this._openDialogBranch();
			}
			else if (sViewId.includes("roleManagement")) {
				console.log("Open Role Management Dialog");
				
				const dialogModel = this.getView().getModel("dialogModel");
		
				// Initialize dialog model for role management
				dialogModel.setData({
					roleName: "",
					permissions: []
				});
				console.log("onNew functions");
				this._openNewRoleDialog();
			}			
		},
		

		_openNewRoleDialog: async function () {
			await this.onGetPermissions();
		
			console.log("Open New Role Dialog");
			var oView = this.getView();
			var oDialog = oView.byId("RoleDialog");
		
			if (!oDialog) {
				oDialog = sap.ui.xmlfragment(oView.getId(), "sap.ui.bni.toolpageapp.view.fragments.RoleDialog", this);
				oView.addDependent(oDialog);
			}
		
			// Initialize dialog model with empty data
			var oDialogModel = this.getView().getModel("dialogModel");
			if (!oDialogModel) {
				oDialogModel = new sap.ui.model.json.JSONModel();
				this.getView().setModel(oDialogModel, "dialogModel");
			}
		
			// Set default data for new role
			oDialogModel.setData({
				idRole: null,
				roleName: "",
				permissionskeys: [],
				permissions: [],
				permissionValues: this.getView().getModel("view").getProperty("/permissions") // Ensure permissionValues is set
			});
			
			oDialog.open();
		},

		_openDialogFile: function (oData) {
			// Dapatkan referensi ke dialog
			console.log("oData : ",oData);
			var oView = this.getView();
			var oDialog = oView.byId("excelUploadDialog");
		
			// Jika dialog belum ada, buat dialog baru
			if (!oDialog) {
				oDialog = sap.ui.xmlfragment(oView.getId(), "sap.ui.bni.toolpageapp.view.fragments.excelUploadDialog", this);
				oView.addDependent(oDialog);
			}

			var oDialogModel = new sap.ui.model.json.JSONModel();
			oDialog.setModel(oDialogModel, "dialog");
		
			// Tentukan apakah ini mode Edit atau New
			if (oData) {
				// Mode Edit: Set data ke dalam dialog
				oDialog.setBindingContext(new sap.ui.model.Context(this.getView().getModel("view"), "/files/" + oData.id));
			} else {
				// Mode New: Kosongkan dialog (atau set default)
				oDialog.setBindingContext(null);
			}
		
			// Buka dialog
			oDialog.open();
		},

		_openDialogUser: function (oData) {
			// Dapatkan referensi ke dialog
			console.log("oData : ",oData);
			var oView = this.getView();
			var oDialog = oView.byId("UserDialog");
		
			// Jika dialog belum ada, buat dialog baru
			if (!oDialog) {
				oDialog = sap.ui.xmlfragment(oView.getId(), "sap.ui.bni.toolpageapp.view.fragments.UserDialog", this);
				oView.addDependent(oDialog);
			}

			var oDialogModel = new sap.ui.model.json.JSONModel();
			oDialog.setModel(oDialogModel, "dialog");
		
			// Tentukan apakah ini mode Edit atau New
			if (oData) {
				// Mode Edit: Set data ke dalam dialog
				oDialog.setBindingContext(new sap.ui.model.Context(this.getView().getModel("view"), "/users/" + oData.id));
			} else {
				// Mode New: Kosongkan dialog (atau set default)
				oDialog.setBindingContext(null);
			}
		
			// Buka dialog
			oDialog.open();
		},


		onNameChange: function () {
            console.log("rubah name");
            var oModel = this.getView().getModel("dialogModel");
            oModel.setProperty("/nameState", "None");
            oModel.setProperty("/nameErrorText", "");
		},


		//#endregion

		_loadPermissions: async function () {
			var oViewModel = this.getView().getModel("view");
		
			try {
				const response = await axios.get(`${Config.paths.apiBaseUrl}/api/permissions`);
				if (response.data && Array.isArray(response.data)) {
					oViewModel.setProperty("/permissions", response.data);
				} else {
					console.error("Invalid permissions data:", response.data);
				}
			} catch (error) {
				console.error("Failed to load permissions:", error);
			}
		},

		onPermissionSelectionChange: async function (oEvent) {
			await this.onGetPermissions(); // Ensure all permissions are loaded
		
			let oDialogModel = this.getView().getModel("dialogModel");
			oDialogModel.setProperty("/permissionsState", "None");
            oDialogModel.setProperty("/permissionsErrorText", "");
			let oData = oDialogModel.getData(); // Get full data
			console.log("oData onPermissionSelectionChange:", oData.permissions);
		
			// Ensure permissions array exists
			if (!oData.permissions) {
				oData.permissions = [];
			}
		
			// Fetch the correct model before accessing it
			let oViewModel = this.getView().getModel("view"); // 🔥 Define oViewModel properly
			let aAllPermissions = oViewModel ? oViewModel.getProperty("/permissions") : [];
		
			console.log("🔹 Selected Keys:", this.byId("permissionsMultiCombo").getSelectedKeys());
			console.log("🔹 Existing Permissions:", oData.permissions);
			console.log("🔹 All Permissions (Reference):", aAllPermissions);
		
			// Convert selected keys into permission objects
			let aUpdatedPermissions = this.byId("permissionsMultiCombo").getSelectedKeys().map(permissionId => {
				// Find existing permission by matching permissionId
				let existingPermission = oData.permissions.find(p => String(p.permissionId) === String(permissionId));
		
				// Find the module name and is_write value from the reference permissions (aAllPermissions)
				let permissionData = aAllPermissions.find(p => String(p.id) === String(permissionId));
				console.log("permissionData:", permissionData);
		
				let moduleName = permissionData ? permissionData.name : "Unknown"; // ✅ Should now work
				let is_write = permissionData ? permissionData.is_write : false;
		
				console.log(`🔸 Permission ID: ${permissionId} → Module: ${moduleName}, Write: ${is_write}`);
		
				return existingPermission || { 
					permissionId, 
					moduleName, 
					is_write 
				};
			});
		
			console.log("🔹 Updated Permissions:", aUpdatedPermissions);
		
			// Update model with new permissions list
			oDialogModel.setProperty("/permissions", aUpdatedPermissions);
		},
		
		
		
		
		
		onWriteCheckboxChange: function (oEvent) {
			let oDialogModel = this.getView().getModel("dialogModel");
			let oContext = oEvent.getSource().getBindingContext("dialogModel");
			let oPermission = oContext.getObject();
		
			console.log("odialogModel onwrite:", oDialogModel);
		
			// Toggle the write permission
			oPermission.is_write = oEvent.getParameter("selected");
		
			// Refresh the model
			oDialogModel.refresh();
		},


		onEdit: function () {

			var sViewId = this.getView().getId();
            if (sViewId.includes("userManagement")) {	
				this._loadProcessData();			
				this._editUser();
            } else if (sViewId.includes("branchOffice")) {
				this._editBranch();
			} else if (sViewId.includes("roleManagement")) {
				this._loadProcessData();
				this._editRole();
			}      
            
        },

		_editRole: async function () {
			await this.onGetPermissions(); // Ensure all permissions are loaded
		
			let oTable = this.byId("TableRole");
			let aSelectedIndices = oTable.getSelectedIndices();
			if (aSelectedIndices.length == 0) {
				sap.m.MessageToast.show("Please select one role to edit.");
				this.onRefresh();
				return;
			}else if (aSelectedIndices.length !== 1) {
				sap.m.MessageToast.show("Please select only one row to edit.");
				this.onRefresh();
				return;
			}
			
			let oContext = oTable.getContextByIndex(aSelectedIndices[0]);
			let oSelectedRole = oContext ? oContext.getObject() : null;
			
			console.log("oSelectedRole permissions:", oSelectedRole);
			if (!oSelectedRole) {
				sap.m.MessageToast.show("No role selected.");
				this.onRefresh();
				return;
			}
			
			let oDialogModel = this.getView().getModel("dialogModel");
			console.log("odiagModel on editrole:", oDialogModel);
			if (!oDialogModel) {
				oDialogModel = new sap.ui.model.json.JSONModel();
				this.onRefresh();
				this.getView().setModel(oDialogModel, "dialogModel");
			}
			
		
			console.log("oSelectedRole.permis:", oSelectedRole);
		
			// Extract selected permission IDs instead of names
			let selectedKeys = oSelectedRole.permissions
				? oSelectedRole.permissions.map(perm => perm.permissionId) // Using ID instead of moduleName
				: [];
		
			// Map module IDs to human-readable names
			var oViewModel = this.getView().getModel("view");
			var aAllPermissions = oViewModel.getProperty("/permissions"); // Fetch all permissions from the view model
			console.log("aAllPermissions on editrole:", aAllPermissions);
			
			var aPermissions = oSelectedRole.permissions.map(perm => {
				var oPermission = aAllPermissions.find(p => p.id === perm.permissionId); // Use permissionId instead of moduleName
				console.log("perm.is_write:", perm.is_write);
				return {
					permissionId: perm.permissionId, // Ensure permissionId is included
					moduleName: oPermission ? oPermission.name : perm.moduleName, // Use human-readable name if available
					is_write: perm.is_write // Ensure is_write is included
				};
			});
		
			// Set only necessary data in dialog model
			oDialogModel.setData({
				idRole: oSelectedRole.id,
				roleName: oSelectedRole.name,
				permissionskeys: selectedKeys,
				permissions: aPermissions
			});
		
			console.log("oDialogModel on editrole:", oDialogModel.getData());
			this.onRefresh();
			this.byId("RoleDialog").open();
		},

		_editUser: function()
		{
			var oTable = this.byId("TableUser"); 
            var aSelectedIndices = oTable.getSelectedIndices(); 
        
            console.log("aSelectedIndices: ", aSelectedIndices);
            if (!aSelectedIndices || aSelectedIndices.length === 0) {
                sap.m.MessageToast.show("No selected data to edit."); 
                return;
            }

            if (aSelectedIndices.length > 1) {
                sap.m.MessageToast.show("Please select only one row to edit.");
                return;
            }
			        
            var oModel = this.getView().getModel("view");
            var aFiles = oModel.getProperty("/users"); 
        
            var aSelectedFiles = aSelectedIndices.map(function (iIndex) {
                var oContext = oTable.getContextByIndex(iIndex); 
                return oContext ? oContext.getObject() : null; 
            }).filter(function (oFile) {
                return oFile !== null;
            });
        
            console.log("Selected Files: ", aSelectedFiles);
        
            if (aSelectedFiles.length === 1) {
             
                var oSelectedData = aSelectedFiles[0];
                console.log("oSelectedData:", oSelectedData);
        
          
                var oDialogModel = this.getView().getModel("dialogModel");
                oDialogModel.setData(oSelectedData);  
        
               
                console.log("oSelectedData.clientCode:", oSelectedData.clientCode);
				console.log("oSelectedData.roles:", oSelectedData.idRoles);
				console.log("Type of oSelectedData.roles:", typeof oSelectedData.idRoles);
				
				const type = typeof oSelectedData.idRoles;
				if( type == "string")
				{
					var rolesArray = oSelectedData.idRoles ? oSelectedData.idRoles.split(",").map(function(idrole) {
						return idrole.trim();
					}) : [];
				}
				
				
                
                oDialogModel.setProperty("/clientCode", oSelectedData.clientCode);
				//oDialogModel.setProperty("/roles", rolesArray);
				oDialogModel.setProperty("/roles", rolesArray);

				
                
      
                this.byId("UserDialog").open();
            } else {
                sap.m.MessageToast.show("Please select only one row to edit.");
            }
		},

		onColumnChange: function (oEvent) {
			var sSelectedKey = oEvent.getSource().getSelectedKey();
			this._selectedColumn = sSelectedKey;
		},

		_editBranch: function()
		{
			var oTable = this.byId("TableClient"); 
            var aSelectedIndices = oTable.getSelectedIndices(); 
        
            console.log("aSelectedIndices: ", aSelectedIndices);
            if (!aSelectedIndices || aSelectedIndices.length === 0) {
                sap.m.MessageToast.show("No selected data to edit."); 
                return;
            }

            if (aSelectedIndices.length > 1) {
                sap.m.MessageToast.show("Please select only one row to edit.");
                return;
            }
			        
            var oModel = this.getView().getModel("view");
            var aBranch = oModel.getProperty("/branch"); 
        
            var aSelectedFiles = aSelectedIndices.map(function (iIndex) {
                var oContext = oTable.getContextByIndex(iIndex); 
                return oContext ? oContext.getObject() : null; 
            }).filter(function (oBranch) {
                return oBranch !== null;
            });
        
            console.log("Selected Files: ", aSelectedFiles);
        
            if (aSelectedFiles.length === 1) {
             
                var oSelectedData = aSelectedFiles[0];
                console.log("oSelectedData:", oSelectedData);
        
          
                var oDialogModel = this.getView().getModel("dialogModel");
                oDialogModel.setData(oSelectedData);  
        
               
                console.log("oSelectedData.code:", oSelectedData.code);
				console.log("oSelectedData.name:", oSelectedData.name);
			
                
                oDialogModel.setProperty("/code", oSelectedData.code);
				oDialogModel.setProperty("/name", oSelectedData.name);              
      
                this.byId("BranchDialog").open();
            } else {
                sap.m.MessageToast.show("Please select only one row to edit.");
            }
		},
		
		_openNewRoleDialog: async function () {
			await this.onGetPermissions();

			console.log("Open New Role Dialog");
			var oView = this.getView();
			var oDialog = oView.byId("RoleDialog");
		
			if (!oDialog) {
				oDialog = sap.ui.xmlfragment(oView.getId(), "sap.ui.bni.toolpageapp.view.fragments.RoleDialog", this);
				oView.addDependent(oDialog);
			}
		
			oDialog.open();
		},

		_openDialogFile: function (oData) {
			// Dapatkan referensi ke dialog
			console.log("oData : ",oData);
			var oView = this.getView();
			var oDialog = oView.byId("excelUploadDialog");
		
			// Jika dialog belum ada, buat dialog baru
			if (!oDialog) {
				oDialog = sap.ui.xmlfragment(oView.getId(), "sap.ui.bni.toolpageapp.view.fragments.excelUploadDialog", this);
				oView.addDependent(oDialog);
			}

			var oDialogModel = new sap.ui.model.json.JSONModel();
			oDialog.setModel(oDialogModel, "dialog");
		
			if (oData) {

				console.log("masuk odata");
				oDialog.setBindingContext(new sap.ui.model.Context(this.getView().getModel("view"), "/files/" + oData.id));
			} else {
				oDialog.setBindingContext(null);// var oFileUploader = this.byId("fileUploader");	
				var oFileUploader = this.byId("fileUploader");
				if (oFileUploader) {
					oFileUploader.setValue("");
					oFileUploader.clear();
				}
			}
		
			// Buka dialog
			oDialog.open();
		},

		_openDialogUser: function (oData) {
			// Dapatkan referensi ke dialog
			console.log("oData : ",oData);
			var oView = this.getView();
			var oDialog = oView.byId("UserDialog");
		
			// Jika dialog belum ada, buat dialog baru
			if (!oDialog) {
				oDialog = sap.ui.xmlfragment(oView.getId(), "sap.ui.bni.toolpageapp.view.fragments.UserDialog", this);
				oView.addDependent(oDialog);
			}

			var oDialogModel = new sap.ui.model.json.JSONModel();
			oDialog.setModel(oDialogModel, "dialog");
		
			// Tentukan apakah ini mode Edit atau New
			if (oData) {
				// Mode Edit: Set data ke dalam dialog
				oDialog.setBindingContext(new sap.ui.model.Context(this.getView().getModel("view"), "/users/" + oData.id));
			} else {
				// Mode New: Kosongkan dialog (atau set default)
				oDialog.setBindingContext(null);
			}
		
			// Buka dialog
			oDialog.open();
		},

		_openDialogBranch: function (oData) {
			// Dapatkan referensi ke dialog
			console.log("oData : ",oData);
			var oView = this.getView();
			var oDialog = oView.byId("BranchDialog");
		
			// Jika dialog belum ada, buat dialog baru
			if (!oDialog) {
				oDialog = sap.ui.xmlfragment(oView.getId(), "sap.ui.bni.toolpageapp.view.fragments.BranchDialog", this);
				oView.addDependent(oDialog);
			}

			var oDialogModel = new sap.ui.model.json.JSONModel();
			oDialog.setModel(oDialogModel, "dialog");
		
			// Tentukan apakah ini mode Edit atau New
			if (oData) {
				// Mode Edit: Set data ke dalam dialog
				oDialog.setBindingContext(new sap.ui.model.Context(this.getView().getModel("view"), "/branch/" + oData.id));
			} else {
				// Mode New: Kosongkan dialog (atau set default)
				oDialog.setBindingContext(null);
			}
		
			// Buka dialog
			oDialog.open();
		},

		_editBranch: function()
		{
			var oTable = this.byId("TableClient"); 
            var aSelectedIndices = oTable.getSelectedIndices(); 
        
            console.log("aSelectedIndices: ", aSelectedIndices);
            if (!aSelectedIndices || aSelectedIndices.length === 0) {
                sap.m.MessageToast.show("No selected data to edit."); 
                return;
            }

            if (aSelectedIndices.length > 1) {
                sap.m.MessageToast.show("Please select only one row to edit.");
                return;
            }
			        
            var oModel = this.getView().getModel("view");
            var aBranch = oModel.getProperty("/branch"); 
        
            var aSelectedFiles = aSelectedIndices.map(function (iIndex) {
                var oContext = oTable.getContextByIndex(iIndex); 
                return oContext ? oContext.getObject() : null; 
            }).filter(function (oBranch) {
                return oBranch !== null;
            });
        
            console.log("Selected Files: ", aSelectedFiles);
        
            if (aSelectedFiles.length === 1) {
             
                var oSelectedData = aSelectedFiles[0];
                console.log("oSelectedData:", oSelectedData);
        
          
                var oDialogModel = this.getView().getModel("dialogModel");
                oDialogModel.setData(oSelectedData);  
        
               
                console.log("oSelectedData.code:", oSelectedData.code);
				console.log("oSelectedData.name:", oSelectedData.name);
			
                
                oDialogModel.setProperty("/code", oSelectedData.code);
				oDialogModel.setProperty("/name", oSelectedData.name);              
      
                this.byId("BranchDialog").open();
            } else {
                sap.m.MessageToast.show("Please select only one row to edit.");
            }
		},
		
		_openNewRoleDialog: async function () {
			await this.onGetPermissions();

			console.log("Open New Role Dialog");
			var oView = this.getView();
			var oDialog = oView.byId("RoleDialog");
		
			if (!oDialog) {
				oDialog = sap.ui.xmlfragment(oView.getId(), "sap.ui.bni.toolpageapp.view.fragments.RoleDialog", this);
				oView.addDependent(oDialog);
			}
		
			oDialog.open();
		},

		_openDialogFile: function (oData) {
			// Dapatkan referensi ke dialog
			console.log("oData : ",oData);
			var oView = this.getView();
			var oDialog = oView.byId("excelUploadDialog");
		
			// Jika dialog belum ada, buat dialog baru
			if (!oDialog) {
				oDialog = sap.ui.xmlfragment(oView.getId(), "sap.ui.bni.toolpageapp.view.fragments.excelUploadDialog", this);
				oView.addDependent(oDialog);
			}

			var oDialogModel = new sap.ui.model.json.JSONModel();
			oDialog.setModel(oDialogModel, "dialog");
		
			if (oData) {

				console.log("masuk odata");
				oDialog.setBindingContext(new sap.ui.model.Context(this.getView().getModel("view"), "/files/" + oData.id));
			} else {
				oDialog.setBindingContext(null);// var oFileUploader = this.byId("fileUploader");	
				var oFileUploader = this.byId("fileUploader");
				if (oFileUploader) {
					oFileUploader.setValue("");
					oFileUploader.clear();
				}
			}
		
			// Buka dialog
			oDialog.open();
		},

		_openDialogUser: function (oData) {
			// Dapatkan referensi ke dialog
			console.log("oData : ",oData);
			var oView = this.getView();
			var oDialog = oView.byId("UserDialog");
		
			// Jika dialog belum ada, buat dialog baru
			if (!oDialog) {
				oDialog = sap.ui.xmlfragment(oView.getId(), "sap.ui.bni.toolpageapp.view.fragments.UserDialog", this);
				oView.addDependent(oDialog);
			}

			var oDialogModel = new sap.ui.model.json.JSONModel();
			oDialog.setModel(oDialogModel, "dialog");
		
			// Tentukan apakah ini mode Edit atau New
			if (oData) {
				// Mode Edit: Set data ke dalam dialog
				oDialog.setBindingContext(new sap.ui.model.Context(this.getView().getModel("view"), "/users/" + oData.id));
			} else {
				// Mode New: Kosongkan dialog (atau set default)
				oDialog.setBindingContext(null);
			}
		
			// Buka dialog
			oDialog.open();
		},

		_openDialogBranch: function (oData) {
			// Dapatkan referensi ke dialog
			console.log("oData : ",oData);
			var oView = this.getView();
			var oDialog = oView.byId("BranchDialog");
		
			// Jika dialog belum ada, buat dialog baru
			if (!oDialog) {
				oDialog = sap.ui.xmlfragment(oView.getId(), "sap.ui.bni.toolpageapp.view.fragments.BranchDialog", this);
				oView.addDependent(oDialog);
			}

			var oDialogModel = new sap.ui.model.json.JSONModel();
			oDialog.setModel(oDialogModel, "dialog");
		
			// Tentukan apakah ini mode Edit atau New
			if (oData) {
				// Mode Edit: Set data ke dalam dialog
				oDialog.setBindingContext(new sap.ui.model.Context(this.getView().getModel("view"), "/branch/" + oData.id));
			} else {
				// Mode New: Kosongkan dialog (atau set default)
				oDialog.setBindingContext(null);
			}
		
			// Buka dialog
			oDialog.open();
		},

		onRefresh: function () {
			let oBinding;
			var sViewId = this.getView().getId();
			console.log("refresh : ",sViewId);
			console.log("refresh : ",sViewId);
            if (sViewId.includes("userManagement")) {                
				this._setupUserManagement().then(() => {
					var oViewModel = this.getModel("view");
					if (oViewModel) {
						oViewModel.refresh(true); 
					}
					var oTable = this.byId("TableUser");  
					if (oTable) {
						oTable.clearSelection();
					}
					oBinding = oTable.getBinding("rows");
                	oBinding.filter([]);
				}).catch((error) => {
					console.error("Error during refresh:", error);
				});
            } else if (sViewId.includes("detailSettings")) {
				this._initializeAsyncData().then(() => {
					var oViewModel = this.getModel("view");
					if (oViewModel) {
						oViewModel.refresh(true); 
					}
					var oTable = this.byId("TableUpload");  
					if (oTable) {
						oTable.clearSelection();
					}
					oBinding = oTable.getBinding("rows");
                	oBinding.filter([]);
				}).catch((error) => {
					console.error("Error during refresh:", error);
				});
            } else if (sViewId.includes("roleManagement")) {
				this._setupRoleManagement().then(() => {
					var oViewModel = this.getModel("view");
					if (oViewModel) {
						oViewModel.refresh(true); 
					}
					var oTable = this.byId("TableRole");  
					if (oTable) {
						oTable.clearSelection();
					}
					oBinding = oTable.getBinding("rows");
                	oBinding.filter([]);
                	oBinding.filter([]);
				}).catch((error) => {
					console.error("Error during refresh:", error);
				});
            } else if (sViewId.includes("roleManagement")) {
				this._setupRoleManagement().then(() => {
					var oViewModel = this.getModel("view");
					if (oViewModel) {
						oViewModel.refresh(true); 
					}
					var oTable = this.byId("TableRole");  
					if (oTable) {
						oTable.clearSelection();
					}
					oBinding = oTable.getBinding("rows");
					oBinding.filter([]);
				}).catch((error) => {
					console.error("Error during refresh:", error);
				});
            } else if (sViewId.includes("branchOffice")) {
				this._setupBranchOffice().then(() => {
					var oViewModel = this.getModel("view");
					if (oViewModel) {
						oViewModel.refresh(true); 
					}
					var oTable = this.byId("TableClient");  
					if (oTable) {
						oTable.clearSelection();
					}
					oBinding = oTable.getBinding("rows");
                	oBinding.filter([]);
				}).catch((error) => {
					console.error("Error during refresh:", error);
				});
            } else if (sViewId.includes("roleManagement")) {
				this._setupRoleManagement().then(() => {
					var oViewModel = this.getModel("view");
					if (oViewModel) {
						oViewModel.refresh(true); 
					}
					var oTable = this.byId("TableRole");  
					if (oTable) {
						oTable.clearSelection();
					}
					oBinding = oTable.getBinding("rows");
					oBinding.filter([]);
				}).catch((error) => {
					console.error("Error during refresh:", error);
				});
            } else if (sViewId.includes("branchOffice")) {
				this._setupBranchOffice().then(() => {
					var oViewModel = this.getModel("view");
					if (oViewModel) {
						oViewModel.refresh(true); 
					}
					var oTable = this.byId("TableClient");  
					if (oTable) {
						oTable.clearSelection();
					}
					oBinding = oTable.getBinding("rows");
                	oBinding.filter([]);
				}).catch((error) => {
					console.error("Error during refresh:", error);
				});
            }		
		},

		onSearch: function (oEvent) {
			var sQuery = oEvent.getSource().getValue();
			console.log("sQuery : ",sQuery);
			var sViewId = this.getView().getId();
			let oTable;

            if (sViewId.includes("userManagement")) {
                oTable = this.byId("TableUser");
            } else if (sViewId.includes("detailSettings")) {
                oTable = this.byId("TableUpload");
            } else if (sViewId.includes("roleManagement")) {
				oTable = this.byId("TableRole");
			} else if (sViewId.includes("branchOffice")) {
				oTable = this.byId("TableClient");
			} else if (sViewId.includes("logManagement")) {
				oTable = this.byId("TableLogManagement");
			}				
            var oBinding = oTable.getBinding("rows");

            // Menyaring berdasarkan kolom yang dipilih
            console.log("this._selectedColumn : ", this._selectedColumn);
            if (this._selectedColumn === "createdAt" || this._selectedColumn === "updatedAt" || this._selectedColumn === "LoginAt" || this._selectedColumn === "LogoutAt" || this._selectedColumn === "ResetAt" || this._selectedColumn === "Timestamp") {
                // Jika sQuery berisi tanggal, ubah ke objek Date
                console.log("sQuery : ", sQuery);
                if (sQuery) {
                    // Menggunakan FilterOperator.Contains untuk pencarian yang lebih fleksibel
                    var oFilter = new sap.ui.model.Filter(this._selectedColumn, sap.ui.model.FilterOperator.Contains, sQuery);
                    oBinding.filter([oFilter]);
                } else {
                    oBinding.filter([]);
                }
            } else {
                // Jika kolom adalah string, gunakan FilterOperator.Contains
                if (sQuery) {
                    var oFilter = new sap.ui.model.Filter(this._selectedColumn, sap.ui.model.FilterOperator.Contains, sQuery);
                    oBinding.filter([oFilter]);
                } else {
                    oBinding.filter([]);
                }
            }
        },      
		
		onDelete:function(){
			var sViewId = this.getView().getId();

            if (sViewId.includes("userManagement")) {
                this.onDeleteUser();
				//this._loadProcessData();
            } else if (sViewId.includes("detailSettings")) {
                this.onDeleteFile();
            } else if (sViewId.includes("roleManagement")) {
				this.onDeleteRole();
			} 
			else if (sViewId.includes("branchOffice")) {
				this.onDeleteBranch();
			}
		},
					
		onDeleteRole: function () {
			var oTable = this.byId("TableRole");

			if (!oTable) {
				sap.m.MessageToast.show("Table not found. Please check the ID.");
				return;
			}

			if (!(oTable instanceof sap.ui.table.Table)) {
				sap.m.MessageToast.show("TableRole is not an instance of sap.ui.table.Table.");
				return;
			}

			var aSelectedIndices = oTable.getSelectedIndices();
    
			

			if (aSelectedIndices.length === 0) {
				sap.m.MessageToast.show("Please select at least one role to delete.");
				return;
			}
		
			var oModel = this.getView().getModel("view");
			var aRoles = oModel.getProperty("/roles");
			var aSelectedRoles = aSelectedIndices.map(i => aRoles[i]);
		
			sap.m.MessageBox.confirm("Are you sure you want to delete the selected roles?", {
				actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
				onClose: async function (sAction) {
					if (sAction === sap.m.MessageBox.Action.YES) {
						try {
							var aRoleIds = aSelectedRoles.map(role => role.id);
							await axios.delete(Config.paths.apiBaseUrl + "/api/role/delete", {
								data: aRoleIds,
								headers: { "Content-Type": "application/json" }
							});
							sap.m.MessageToast.show("Roles deleted successfully.");
							this.onRefresh();
						} catch (error) {
							sap.m.MessageToast.show("Error deleting roles.");
						}
					}
				}.bind(this)
			});




		},

		onDeleteFile: function () {
			const header = {  "Content-Type": "application/json" };
            var oTable = this.byId("TableUpload");
            var aSelectedIndices = oTable.getSelectedIndices();
            console.log("aSelectedIndices: ", aSelectedIndices);
            if (!aSelectedIndices || aSelectedIndices.length === 0) {
                sap.m.MessageToast.show("No selected data to delete.");
                return;
            }
            
            // Ambil model tabel
            var oModel = this.getView().getModel("view");
            var aFiles = oModel.getProperty("/files"); // Data asli dari model

            // Ambil data yang dipilih
            var aSelectedFiles = aSelectedIndices.map(function (iIndex) {
                var oContext = oTable.getContextByIndex(iIndex); // Dapatkan context
                return oContext ? oContext.getObject() : null; // Ambil data baris
            }).filter(function (oFile) {
                return oFile !== null; // Filter data null (jika ada)
            });

            console.log("Selected Files: ", aSelectedFiles);
			// Tampilkan konfirmasi dialog
			sap.m.MessageBox.confirm("Are you sure you want to delete the selected data?", {
				actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
				onClose: async function (sAction) {
					if (sAction === sap.m.MessageBox.Action.YES) {
						
						var aIds = aSelectedFiles.map(function (item) {
							return item.id;
						});
	
						console.log("Selected IDs: ", aIds);
						const response = await this.appConfig.allAPI("delete", header, aIds, Config.paths.apiBaseUrl + "/api/file/delete");                            
						console.log("Response Delete: ", response);
						if(!response)
						{
							MessageToast.show("Token expired.", { duration: 3000 });                   
							const oView = this.getView();
							const oComponent = sap.ui.core.Component.getOwnerComponentFor(oView);
							const oRouter = oComponent.getRouter();
							console.log("Router:", oRouter);
							oRouter.navTo("login");
						}
						else
						{
							if (response == "Token expired" ) { 
								// MessageToast.show("Token expired.", { duration: 3000 });                   
								// const oView = this.getView();
								// const oComponent = sap.ui.core.Component.getOwnerComponentFor(oView);
								// const oRouter = oComponent.getRouter();
								// console.log("Router:", oRouter);
								// oRouter.navTo("login");
								MessageToast.show("Token expired.", { duration: 3000 });			
								var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
								this.appConfig.logout(oRouter);
							}
							if (response.data.error) {
								sap.m.MessageToast.show(response.data.message, { duration: 3000 });
							} else {
								sap.m.MessageToast.show("Data deleted successfully.", { duration: 3000 });
							}
						}
						this.onRefresh();	
						
											
					}
				}.bind(this)
			});
		},

		onDeleteUser: function () {

			const header = {  "Content-Type": "application/json" };

            var oTable = this.byId("TableUser");
            var aSelectedIndices = oTable.getSelectedIndices();
            console.log("aSelectedIndices: ", aSelectedIndices);
            if (!aSelectedIndices || aSelectedIndices.length === 0) {
                sap.m.MessageToast.show("No selected data to delete.");
                return;
            }
            
            // Ambil model tabel
            var oModel = this.getView().getModel("view");
            var aUsers = oModel.getProperty("/users"); // Data asli dari model

            // Ambil data yang dipilih
            var aSelectedUsers = aSelectedIndices.map(function (iIndex) {
                var oContext = oTable.getContextByIndex(iIndex); // Dapatkan context
                return oContext ? oContext.getObject() : null; // Ambil data baris
            }).filter(function (oFile) {
                return oFile !== null; // Filter data null (jika ada)
            });

            console.log("Selected Users: ", aSelectedUsers);
			// Tampilkan konfirmasi dialog
			sap.m.MessageBox.confirm("Are you sure you want to delete the selected data?", {
				actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
				onClose: async function (sAction) {
					if (sAction === sap.m.MessageBox.Action.YES) {
						try {
							// Ambil ID dari data terpilih
							var aIds = aSelectedUsers.map(function (item) {
								return item.id;
							});
		
							console.log("Selected IDs: ", aIds);
		
							// Kirim request DELETE dengan Axios
							// const response = await axios.delete(Config.paths.apiBaseUrl + "/api/user/delete",  {
							// 	data: aIds,
							// 	headers: {
							// 		"Content-Type": "application/json"
							// 	}
							// });

							const response = await this.appConfig.allAPI("delete", header, aIds, Config.paths.apiBaseUrl + "/api/user/delete");                            
                            console.log("Response Delete: ", response);	
							if (response == "Token expired" ) { 
								// MessageToast.show("Token expired.", { duration: 3000 });                   
								// const oView = this.getView();
                                // const oComponent = sap.ui.core.Component.getOwnerComponentFor(oView);
                                // const oRouter = oComponent.getRouter();
                                // console.log("Router:", oRouter);
                                // oRouter.navTo("login");                     
								//return; // Hentikan eksekusi jika token expired
									MessageToast.show("Token expired.", { duration: 3000 });			
									var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
									this.appConfig.logout(oRouter);
								}
	
							// Hapus data yang dihapus dari model
							// var aRemainingUsers = aUsers.filter(function (user) {
							// 	return !aIds.includes(user.id);
							// });
                            // console.log("aRemainingUsers: ", aRemainingUsers);
							// this.getView().getModel("view").setProperty("/users", aRemainingUsers);							
                            this.onRefresh();
							// Tampilkan notifikasi
							if (response.data.error) {
								sap.m.MessageToast.show(response.data.message, { duration: 3000 });
							} else {
								sap.m.MessageToast.show("Data deleted successfully.", { duration: 3000 });
							}
						} catch (error) {
							// Tangani error dari Axios
							if (error.response) {
								sap.m.MessageToast.show("Error: " + error.response.data.message, { duration: 3000 });
							} else {
								sap.m.MessageToast.show("An unexpected error occurred.", { duration: 3000 });
							}
						}
					}
				}.bind(this)
			});
		},
		//#endregion
		
		onDeleteBranch: function () {

			const header = {  "Content-Type": "application/json" };

            var oTable = this.byId("TableClient");
            var aSelectedIndices = oTable.getSelectedIndices();
            console.log("aSelectedIndices: ", aSelectedIndices);
            if (!aSelectedIndices || aSelectedIndices.length === 0) {
                sap.m.MessageToast.show("No selected data to delete.");
                return;
            }
            
            // Ambil model tabel
            var oModel = this.getView().getModel("view");
            var aBranch = oModel.getProperty("/branch"); // Data asli dari model

            // Ambil data yang dipilih
            var aSelectedBranch = aSelectedIndices.map(function (iIndex) {
                var oContext = oTable.getContextByIndex(iIndex); // Dapatkan context
                return oContext ? oContext.getObject() : null; // Ambil data baris
            }).filter(function (oBranch) {
                return oBranch !== null; // Filter data null (jika ada)
            });

            console.log("Selected Branch: ", aSelectedBranch);
			// Tampilkan konfirmasi dialog
			sap.m.MessageBox.confirm("Are you sure you want to delete the selected data?", {
				actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
				onClose: async function (sAction) {
					if (sAction === sap.m.MessageBox.Action.YES) {
						try {
							// Ambil ID dari data terpilih
							var aIds = aSelectedBranch.map(function (item) {
								return item.id;
							});
		
							console.log("Selected IDs: ", aIds);
							const response = await this.appConfig.allAPI("delete", header, aIds, Config.paths.apiBaseUrl + "/api/client/delete");                            
                            console.log("Response Delete: ", response);	
							if (response == "Token expired" ) { 
								// MessageToast.show("Token expired.", { duration: 3000 });                   
								// const oView = this.getView();
                                // const oComponent = sap.ui.core.Component.getOwnerComponentFor(oView);
                                // const oRouter = oComponent.getRouter();
                                // console.log("Router:", oRouter);
                                // oRouter.navTo("login");                     
								//return; // Hentikan eksekusi jika token expired
								MessageToast.show("Token expired.", { duration: 3000 });			
								var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
								this.appConfig.logout(oRouter);
							}
						
                            this.onRefresh();		
							// Tampilkan notifikasi
							if (response.error) {
								sap.m.MessageToast.show(response.message, { duration: 3000 });
							} else {
								sap.m.MessageToast.show("Data deleted successfully.", { duration: 3000 });
							}
						} catch (error) {
							// Tangani error dari Axios
							if (error.response) {
								sap.m.MessageToast.show("Error: " + error.response.data.message, { duration: 3000 });
							} else {
								sap.m.MessageToast.show("An unexpected error occurred.", { duration: 3000 });
							}
						}
					}
				}.bind(this)
			});
		},

        onCloseDialog: function () {
            // Tutup dialog
            this.getView().byId("excelUploadDialog").close();
        },

        onFileChange: function (oEvent) {
            // Validasi file yang diunggah
            var oFileUploader = oEvent.getSource();
            var sFileName = oFileUploader.getValue();

            if (!sFileName.endsWith(".xlsx") && !sFileName.endsWith(".xls")) {
                MessageToast.show("Invalid file type. Please select an Excel file.");
                oFileUploader.setValue("");
            }
        },

		onUsernameChange: function () {
            var oModel = this.getView().getModel("dialogModel");
            oModel.setProperty("/usernameState", "None");
            oModel.setProperty("/usernameErrorText", "");
		},

		onFullnameChange: function () {
            var oModel = this.getView().getModel("dialogModel");
            oModel.setProperty("/fullnameState", "None");
            oModel.setProperty("/fullnameErrorText", "");
		},

		onEmailChange: function () {
            var oModel = this.getView().getModel("dialogModel");
            oModel.setProperty("/emailState", "None");
            oModel.setProperty("/emailErrorText", "");
		},

		onClientChange: function () {
            var oModel = this.getView().getModel("dialogModel");
            oModel.setProperty("/clientState", "None");
            oModel.setProperty("/clientErrorText", "");
		},

		onRolesChange: function () {
            var oModel = this.getView().getModel("dialogModel");
            oModel.setProperty("/rolesState", "None");
            oModel.setProperty("/rolesErrorText", "");
		},

		onCodeChange: function () {
            var oModel = this.getView().getModel("dialogModel");
            oModel.setProperty("/codeState", "None");
            oModel.setProperty("/codeErrorText", "");
		},

		onNameChange: function () {
            var oModel = this.getView().getModel("dialogModel");
            oModel.setProperty("/nameState", "None");
            oModel.setProperty("/nameErrorText", "");
		},        

		onUsernameChange: function () {
            var oModel = this.getView().getModel("dialogModel");
            oModel.setProperty("/usernameState", "None");
            oModel.setProperty("/usernameErrorText", "");
		},

		onFullnameChange: function () {
            var oModel = this.getView().getModel("dialogModel");
            oModel.setProperty("/fullnameState", "None");
            oModel.setProperty("/fullnameErrorText", "");
		},

		onEmailChange: function () {
            var oModel = this.getView().getModel("dialogModel");
            oModel.setProperty("/emailState", "None");
            oModel.setProperty("/emailErrorText", "");
		},

		onClientChange: function () {
            var oModel = this.getView().getModel("dialogModel");
            oModel.setProperty("/clientState", "None");
            oModel.setProperty("/clientErrorText", "");
		},

		onRolesChange: function () {
            var oModel = this.getView().getModel("dialogModel");
            oModel.setProperty("/rolesState", "None");
            oModel.setProperty("/rolesErrorText", "");
		},

		onCodeChange: function () {
            var oModel = this.getView().getModel("dialogModel");
            oModel.setProperty("/codeState", "None");
            oModel.setProperty("/codeErrorText", "");
		},

		onNameChange: function () {
            var oModel = this.getView().getModel("dialogModel");
            oModel.setProperty("/nameState", "None");
            oModel.setProperty("/nameErrorText", "");
		},

		onUpload: async function () {
			const oDialog = this.byId("excelUploadDialog");
			const oFileUploader = this.byId("fileUploader");
			const oDomRef = oFileUploader.getDomRef();
			const oFileInput = oDomRef && oDomRef.querySelector("input[type='file']");

			console.log("oFileInput : ",oFileInput);
			console.log("oFileInput.files : ",oFileInput.files);
			console.log("oFileInput.files.length : ",oFileInput.files.length);
		
			if (!oFileInput || !oFileInput.files || oFileInput.files.length === 0) {
				sap.m.MessageToast.show("Please select a file to upload.");
				return;
			}
		
			const oFile = oFileInput.files[0];
			console.log("Selected file:", oFile);
		
			// Validasi jenis file
			const sFileName = oFile.name.toLowerCase();
			if (!sFileName.endsWith(".xls") && !sFileName.endsWith(".xlsx")) {
				sap.m.MessageToast.show("Invalid file type. Please upload an Excel file.");
				return;
			}
		
			try {
				//sap.ui.core.BusyIndicator.show(0);
		
				const oFormData = new FormData();
				oFormData.append("payload", JSON.stringify({ path: "text" }));
				oFormData.append("files", oFile);
		
				const sApiUrl = "http://nexia-main.pypsak.cloud/api/file";
				const oResponse = await axios.post(sApiUrl, oFormData, {
					headers: {
						"Content-Type": "multipart/form-data",
					},
				});
		
				sap.m.MessageToast.show("File uploaded successfully.");
				console.log("Upload response:", oResponse.data);
				oFileUploader.clear();
				oFileInput.value = "";
				oFileUploader.clear();
				oFileInput.value = "";
				oDialog.close();
				//console.log("event : ",oEvent.data)
				this.onRefresh();
			} catch (oError) {
				console.error("Error uploading file:", oError);
				sap.m.MessageToast.show("Failed to upload file.");
			} finally {
				sap.ui.core.BusyIndicator.hide();
			}
		},		

		onDownloadFile: async function (oEvent) {
  
            // Retrieve the row data from the binding context
			
			console.log("masuk onDownload");
			const oText = oEvent.getSource();
			const fileName = oText.getText();

			var oBindingContext = oEvent.getSource().getBindingContext("view");		
			const oRowData = oBindingContext.getObject();
	
		
			const idFile = oRowData.id;
			console.log("idFile:", idFile);
			const header = {  "Content-Type": "application/json" };
			//const params = { idFile };

			
			console.log("before call API");
			const oResponse = await this.appConfig.downloadFile(Config.paths.apiBaseUrl +'/api/get_file/' + idFile, {}, fileName);
			
			console.log("oResponse Download :",oResponse);
			
			// if (oResponse) { 
				
			// 	MessageToast.show("Token expired.", { duration: 3000 });                   
			// 	const oView = this.getView();
			// 	const oComponent = sap.ui.core.Component.getOwnerComponentFor(oView);
			// 	const oRouter = oComponent.getRouter();
			// 	console.log("Router:", oRouter);
			// 	oRouter.navTo("login");                     
			// 	//return; // Hentikan eksekusi jika token expired
			// }

			if (oResponse) {
				console.log("oRespones : ",oResponse.message)
				if(oResponse == "Token expired")
				{
					// MessageToast.show("Token expired.", { duration: 3000 });                   
					// const oView = this.getView();
					// const oComponent = sap.ui.core.Component.getOwnerComponentFor(oView);
					// const oRouter = oComponent.getRouter();
					// console.log("Router:", oRouter);
					// oRouter.navTo("login"); 
					MessageToast.show("Token expired.", { duration: 3000 });			
					var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
					this.appConfig.logout(oRouter);
				}
				if(oResponse == 400)
				{
					console.log("File template not found");
					MessageToast.show("File not found");
				}			
			} else {
				console.log("Error:", error.message);
				return error.message;
			}
			

        },

		onClearLogs: function() {
            var oModel = this.getView().getModel("logModel");
            oModel.setProperty("/logs", []);
        },
		
		isValidEmail: function (email) {
			const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
			const domainPart = email.split("@")[1]; 
			if (/\d/.test(domainPart)) {
				return false;
			}
			
			return emailRegex.test(email);
		},

		formatPermission: function (permissions) {
			// Assuming permissions is an array of objects and you want to check if any permission allows writing
			if (permissions && permissions.length > 0) {
				const hasWritePermission = permissions.some(perm => perm.isWrite);
				return hasWritePermission ? "read" : "read/write";
			}
			return "read";
		},

		onExport: async function  ()
		{
			this.saveLogsToFile();
		},

		saveLogsToFile: function() {
			var logs = localStorage.getItem("consoleLogs");
			if (!logs) {
				console.warn("Log not found");
				return;
			}
			
			var date = new Date();
			var fileName = "console_logs_" + date.toISOString().split('T')[0] + ".txt";
			
			var blob = new Blob([logs], { type: "text/plain" });
			var link = document.createElement("a");
			link.href = URL.createObjectURL(blob);
			link.download = fileName;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
		},
        

		/**
		 * Returns a promises which resolves with the resource bundle value of the given key <code>sI18nKey</code>
		 *
		 * @public
		 * @param {string} sI18nKey The key
		 * @param {string[]} [aPlaceholderValues] The values which will repalce the placeholders in the i18n value
		 * @returns {Promise<string>} The promise
		 */
		// getBundleText: function(sI18nKey, aPlaceholderValues){
		// 	return this.getBundleTextByModel(sI18nKey, this.getModel("i18n"), aPlaceholderValues);
		// }

	
	});
});