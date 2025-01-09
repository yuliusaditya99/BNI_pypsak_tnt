sap.ui.define([
	'sap/ui/bni/toolpageapp/controller/BaseController',
	'sap/m/MessageToast',
	'sap/ui/model/json/JSONModel',
	'sap/ui/bni/toolpageapp/model/formatter',
	'sap/ui/core/date/UI5Date'
], function (BaseController, MessageToast, JSONModel, formatter, UI5Date) {
	"use strict";
	return BaseController.extend("sap.ui.bni.toolpageapp.controller.settings.MasterSettings", {
		
		formatter: formatter,
		

		onInit: function () {
			var oViewModel = new JSONModel({
					currentUser: "Administrator",
					lastLogin: UI5Date.getInstance(Date.now() - 86400000)
				});

			this.setModel(oViewModel, "view");
			console.log("masuk");
			this._initializeAsyncData();
		},

		_initializeAsyncData: async function () {
			try {
			  
			  console.log("Set Header 1:", axios.defaults.headers.common["Authorization"]);
			  const fileResponse = await axios.get('http://nexia-main.pypsak.cloud/api/file');
		  
			  const fileData = fileResponse.data;
			  const filetableData = fileData.payloads.data;
		  
			  const files = filetableData.map(file => ({
				fileName: file.file_name,
				path: file.path,
				contentType: file.content_type,
				extension: file.extension,
				createdAt: file.created_at,
				createdBy: file.created_by,
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

		// _initializeAsyncData: async function () {
		// 	try {
		// 		const clientId = 'clientid';
		// 		const clientSecret = 'secret';
		// 		const encodedCredentials = btoa(`${clientId}:${clientSecret}`); 
		
		// 		const oauthResponse = await fetch('http://nexia-main.pypsak.cloud/token', {
		// 			method: 'POST',
		// 			headers: {
		// 				'Content-Type': 'application/x-www-form-urlencoded',
		// 				'Authorization': `Basic ${encodedCredentials}`
		// 			},
		// 			body: new URLSearchParams({
		// 				'grant_type': 'password',
		// 				'username': 'raymond',
		// 				'password': 'zbZX16}+'
		// 			})
		// 		});
		
		// 		if (!oauthResponse.ok) {
		// 			throw new Error('Failed to fetch OAuth token');
		// 		}
		
		// 		const oauthData = await oauthResponse.json();
		// 		const accessToken = oauthData.access_token;
		// 		console.log("OauthData: ", oauthData);
		// 		console.log("OAuth Access Token:", accessToken);
		
		// 		const fileResponse = await fetch('http://nexia-main.pypsak.cloud/api/file', {
		// 			headers: {
		// 				'Authorization': `Bearer ${accessToken}`
		// 			}
		// 		});
		
		// 		const fileData = await fileResponse.json();
		// 		const filetableData = fileData.payloads.data;
		
		// 		const files = filetableData.map(file => ({
		// 			fileName: file.file_name,
		// 			path: file.path,
		// 			contentType: file.content_type,
		// 			extension: file.extension,
		// 			createdAt: file.created_at,
		// 			createdBy: file.created_by,
		// 			size: file.size_bytes,
		// 		}));
		// 		console.log("Files:", files);
		
		// 		// Tambahkan data ke model "view"
		// 		const oViewModel = this.getModel("view");
		// 		if (oViewModel) {
		// 			oViewModel.setProperty("/files", files);
		// 		} else {
		// 			console.error("View model not found.");
		// 		}
		// 	} catch (error) {
		// 		console.error("Error during async initialization:", error);
		// 	}
		// },

		onMasterPressed: function (oEvent) {
			var oContext = oEvent.getParameter("listItem").getBindingContext("side");
			var sPath = oContext.getPath() + "/selected";
			oContext.getModel().setProperty(sPath, true);
			var sKey = oContext.getProperty("key");
			switch (sKey) {
				case "processDefinitions": {
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

		onNavButtonPress: function  () {
			this.getOwnerComponent().myNavBack();
		},


		onSelectAll: function (oEvent) {
			var bSelected = oEvent.getSource().getSelected();
			var aFiles = this.getView().getModel("view").getProperty("/files");
		
			aFiles.forEach(function (file) {
				file.selected = bSelected;
			});
		
			this.getView().getModel("view").refresh();
		},

		onNew: function () {
            // Buka dialog
            var oView = this.getView();
            var oDialog = oView.byId("excelUploadDialog");

            if (!oDialog) {
                oDialog = sap.ui.xmlfragment(oView.getId(), "sap.ui.bni.toolpageapp.view.fragments.ExcelUploadDialog", this);
                oView.addDependent(oDialog);
            }
            oDialog.open();
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

		onUpload: async function () {
			const oDialog = this.byId("excelUploadDialog");
			const oFileUploader = this.byId("fileUploader");
		
			// Ambil elemen input file
			const oDomRef = oFileUploader.getDomRef();
			const oFileInput = oDomRef && oDomRef.querySelector("input[type='file']");
		
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
				sap.ui.core.BusyIndicator.show(0);
		
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
		
				oDialog.close();
			} catch (oError) {
				console.error("Error uploading file:", oError);
				sap.m.MessageToast.show("Failed to upload file.");
			} finally {
				sap.ui.core.BusyIndicator.hide();
			}
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