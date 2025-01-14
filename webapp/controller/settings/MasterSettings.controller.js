sap.ui.define([
	'sap/ui/bni/toolpageapp/controller/BaseController',
	'sap/m/MessageToast',
	'sap/ui/model/json/JSONModel',
	'sap/ui/bni/toolpageapp/model/formatter',
	'sap/ui/core/date/UI5Date',
	"sap/ui/bni/toolpageapp/util/Config"
], function (BaseController, MessageToast, JSONModel, formatter, UI5Date, Config) {
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
			  const fileResponse = await axios.get(Config.paths.apiBaseUrl +'/api/file');
		  
			  const fileData = fileResponse.data;
			  const filetableData = fileData.payloads.data;
		  
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

		onRowCountChange: function (oEvent) {
			console.log("Masuk onRowCountChange");
			var sSelectedKey = oEvent.getSource().getSelectedKey();
			var oTable = this.byId("TableUpload");
			console.log("oTable 1 : ",oTable);
			if (sSelectedKey === "-1") {				
				var aRows = this.getView().getModel("view").getProperty("/files");
				console.log("aRows : ",aRows);
				oTable.setVisibleRowCount(aRows.length);
			} else {
				var aRows = this.getView().getModel("view").getProperty("/files");
				if(aRows.length <= parseInt(sSelectedKey, 10))
				{
					oTable.setVisibleRowCount(aRows.length);
				}
				else
				{
					oTable.setVisibleRowCount(parseInt(sSelectedKey, 10));
					console.log("sSelectedKey : ",sSelectedKey);
				}
				
			}
		},

		// onColumnChange: function (oEvent) {
		// 	// Menyimpan kolom yang dipilih
		// 	var sSelectedKey = oEvent.getSource().getSelectedKey();
		// 	this._selectedColumn = sSelectedKey;
		// },
		
		onSelectAll: function (oEvent) {
			var bSelected = oEvent.getSource().getSelected();
			var aFiles = this.getView().getModel("view").getProperty("/files");
		
			aFiles.forEach(function (file) {
				file.selected = bSelected;
			});
		
			this.getView().getModel("view").refresh();
		},

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

		onNew: function () {
			this._openDialog(); // Panggil fungsi untuk membuka dialog dalam mode New
		},

		onEdit: function () {
			// Ambil referensi tabel
			var oTable = this.getView().byId("TableUpload");
			console.log("oTable:", oTable);
		
			// Ambil data dari model tabel
			var aRows = oTable.getBinding("rows").getModel().getProperty("/files");
		
			// Filter baris yang dipilih
			var aSelectedRows = aRows.filter(row => row.selected);
			console.log("aSelectedRows:", aSelectedRows);
		
			// Validasi jumlah baris yang dipilih
			if (aSelectedRows.length === 0) {
				sap.m.MessageToast.show("Pilih satu baris untuk diedit.");
				return;
			}
		
			if (aSelectedRows.length > 1) {
				sap.m.MessageToast.show("Hanya satu baris yang dapat diedit pada satu waktu.");
				return;
			}
		
			// Ambil data baris pertama yang dipilih
			var oSelectedRow = aSelectedRows[0];
			console.log("Data yang dipilih untuk edit:", oSelectedRow);
		
			// Lakukan tindakan edit, seperti membuka dialog
			this._openDialog(oSelectedRow);
		},
		
		

		_openDialog: function (oData) {
			// Dapatkan referensi ke dialog
			console.log("oData : ",oData);
			var oView = this.getView();
			var oDialog = oView.byId("excelUploadDialog");
		
			// Jika dialog belum ada, buat dialog baru
			if (!oDialog) {
				oDialog = sap.ui.xmlfragment(oView.getId(), "sap.ui.bni.toolpageapp.view.fragments.ExcelUploadDialog", this);
				oView.addDependent(oDialog);
			}
		
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

		onRefresh: function () {
			// Memanggil fungsi untuk mengambil data terbaru
			this._initializeAsyncData().then(() => {
				// Pastikan view model terupdate dan UI direfresh
				var oViewModel = this.getModel("view");
				if (oViewModel) {
					oViewModel.refresh(true);  // Refresh view model untuk memastikan UI menggunakan data terbaru
				}
			}).catch((error) => {
				console.error("Error during refresh:", error);
			});
		},
		

		onColumnChange: function (oEvent) {
			// Menyimpan kolom yang dipilih
			var sSelectedKey = oEvent.getSource().getSelectedKey();
			this._selectedColumn = sSelectedKey;
		},
		
		onSearch: function (oEvent) {
			var sQuery = oEvent.getSource().getValue();
			var oTable = this.byId("TableUpload");
			var oBinding = oTable.getBinding("rows");
		
			if (sQuery) {
				var oFilter = new sap.ui.model.Filter(this._selectedColumn, sap.ui.model.FilterOperator.Contains, sQuery);
				oBinding.filter([oFilter]);
			} else {
				oBinding.filter([]);
			}
		},


		onDelete: function (oEvent) {
			var aFiles = this.getView().getModel("view").getProperty("/files");
		
			// Filter hanya data yang dipilih
			var aSelectedFiles = aFiles.filter(function (file) {
				return file.selected === true;
			});
			console.log("aSelectedFiles: ", aSelectedFiles);
			if (!aSelectedFiles || aSelectedFiles.length === 0) {
				sap.m.MessageToast.show("No selected data to delete.");
				return;
			}
		
			// Tampilkan konfirmasi dialog
			sap.m.MessageBox.confirm("Are you sure you want to delete the selected data?", {
				actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
				onClose: async function (sAction) {
					if (sAction === sap.m.MessageBox.Action.YES) {
						try {
							// Ambil ID dari data terpilih
							var aIds = aSelectedFiles.map(function (item) {
								return item.id;
							});
		
							console.log("Selected IDs: ", aIds);
		
							// Kirim request DELETE dengan Axios
							const response = await axios.delete(Config.paths.apiBaseUrl + "/api/file/delete",  {
								data: aIds,
								headers: {
									"Content-Type": "application/json"
								}
							});
		
							console.log("Response: ", response);
		
							// Hapus data yang dihapus dari model
							var aRemainingFiles = aFiles.filter(function (file) {
								return !aIds.includes(file.id);
							});
		
							this.getView().getModel("view").setProperty("/files", aRemainingFiles);
		
							// Refresh tabel
							var oTable = this.byId("detailedTable");
							if (oTable) {
								oTable.getBinding("items").refresh();
							}
		
							// Reset checkbox
							var oCheckAll = this.byId("checkAll");
							if (oCheckAll) {
								oCheckAll.setSelected(false);
							}
		
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
			this.onRefresh();
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
				//console.log("event : ",oEvent.data)
				this.onRefresh();
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