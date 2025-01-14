sap.ui.define([
	'./BaseController',
	'sap/ui/model/json/JSONModel',
	'sap/ui/Device',
	'sap/ui/bni/toolpageapp/model/formatter',
    'sap/ui/bni/toolpageapp/util/Config',
    'sap/m/MessageToast',
], function (BaseController, JSONModel, Device, formatter, Config, MessageToast) {
	"use strict";
	return BaseController.extend("sap.ui.bni.toolpageapp.controller.Project", {
		formatter: formatter,

		onInit: function () {
            var oViewModel = new JSONModel({
				isPhone : Device.system.phone
			});

            //this.appCon = new App();
			this.setModel(oViewModel, "view");

            var oDialogModel = new JSONModel({});
            this.setModel(oDialogModel, "dialogModel");
            
			console.log("masuk 2");
			this._initializeAsyncData();
            this._loadProcessData();
			
		},

		_initializeAsyncData: async function () {
			try {
			  
			  console.log("Set Header 2:", axios.defaults.headers.common["Authorization"]);
            //   if(localStorage.getItem("authToken")=="undefined")
            //     appCon.onLoginPress();
            //     console.log("Set Header 3:", axios.defaults.headers.common["Authorization"]);
			  const taskResponse = await axios.get(Config.paths.apiBaseUrl +'/api/task?start=0&length=10&orders=id&dirs=desc');
		  
			  const taskData = taskResponse.data;
			  const tasktableData = taskData.payloads.data;

			  const tasks = tasktableData.map(task => ({
				id: task.id,
                title: task.title,
                asOfDate: task.as_of_date,                
				processDefinition: task.file.file_name || "N/A",
				description: task.description,
				createdBy: task.createdBy?.user_name || "N/A",
				createdAt: task.created_at,
				updatedBy: task.updatedBy?.user_name || "N/A",
				updatedAt: task.updated_at,
			  }));
			  console.log("tasks:", tasks);
		  
			  // Langkah 3: Tambahkan data ke model "view"
			  const oViewModel = this.getModel("view");
			  if (oViewModel) {
				oViewModel.setProperty("/tasks", tasks);
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
        onNew: function () {
            const dialogModel = this.getView().getModel("dialogModel");

            // Reset data model
            dialogModel.setData({
                title: "",
                date: "",
                processDefinition: "",
                description: ""
            });
			this._openDialog(); 
		},

        onEdit: function () {
            var aTask = this.getView().getModel("view").getProperty("/tasks");
        
            var aSelectedTasks = aTask.filter(function (task) {
                return task.selected === true;
            });
        
            if (aSelectedTasks.length === 0) {
                sap.m.MessageToast.show("Please select a row to edit.");
                return;
            }
        
            // Ambil data dari tugas pertama (single select)
            var oSelectedData = aSelectedTasks[0];
            console.log("oSelectedData:", oSelectedData);
        
            // Set data ke model dialog
            var oDialogModel = this.getView().getModel("dialogModel");
            oDialogModel.setData(oSelectedData);
        
            // Buka dialog
            this.byId("ProjectTaskDialog").open();
        },
        
        

        onRefresh: function () {

			this._initializeAsyncData().then(() => {
				var oViewModel = this.getModel("view");
				if (oViewModel) {
					oViewModel.refresh(true); 
				}
			}).catch((error) => {
				console.error("Error during refresh:", error);
			});
		},

        onColumnChange: function (oEvent) {
			var sSelectedKey = oEvent.getSource().getSelectedKey();
			this._selectedColumn = sSelectedKey;
		},

        onRowCountChange: function (oEvent) {
			console.log("Masuk onRowCountChange");
			var sSelectedKey = oEvent.getSource().getSelectedKey();
			var oTable = this.byId("TableTask");
			console.log("oTable 1 : ",oTable);
			if (sSelectedKey === "-1") {				
				var aRows = this.getView().getModel("view").getProperty("/tasks");
				console.log("aRows : ",aRows);
				oTable.setVisibleRowCount(aRows.length);
			} else {
				var aRows = this.getView().getModel("view").getProperty("/tasks");
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

        // onSearch: function (oEvent) {
		// 	var sQuery = oEvent.getSource().getValue();
		// 	var oTable = this.byId("TableTask");
        //     console.log("oTable : ",oTable);
		// 	var oBinding = oTable.getBinding("rows");
		
		// 	if (sQuery) {
		// 		var oFilter = new sap.ui.model.Filter(this._selectedColumn, sap.ui.model.FilterOperator.Contains, sQuery);
		// 		oBinding.filter([oFilter]);
		// 	} else {
		// 		oBinding.filter([]);
		// 	}
		// },

        onSearch: function (oEvent) {
            var sQuery = oEvent.getSource().getValue();
            var oTable = this.byId("TableTask");
            var oBinding = oTable.getBinding("rows");
        
            // Menyaring berdasarkan kolom yang dipilih
            if (this._selectedColumn === "asOfDate" || this._selectedColumn === "createdAt" || this._selectedColumn === "updatedAt") {
                // Jika sQuery berisi tanggal, ubah ke objek Date
                var oDate = sap.ui.core.format.DateFormat.getInstance({ pattern: "yyyy-MM-dd" }).parse(sQuery);
                if (oDate) {
                    // Jika sQuery valid sebagai tanggal, gunakan EQ atau BT
                    var oFilter = new sap.ui.model.Filter(this._selectedColumn, sap.ui.model.FilterOperator.EQ, oDate);
                    oBinding.filter([oFilter]);
                } else {
                    // Jika sQuery tidak valid sebagai tanggal
                    sap.m.MessageToast.show("Invalid date format");
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

        onSelectAll: function (oEvent) {
			var bSelected = oEvent.getSource().getSelected();
			var aTasks = this.getView().getModel("view").getProperty("/tasks");
		
			aTasks.forEach(function (task) {
				task.selected = bSelected;
			});
		
			this.getView().getModel("view").refresh();
		},

		onDelete: function (oEvent) {
			var aTask = this.getView().getModel("view").getProperty("/tasks");		

			var aSelectedTasks = aTask.filter(function (task) {
				return task.selected === true;
			});
			console.log("aSelectedTasks: ", aSelectedTasks);
			if (!aSelectedTasks || aSelectedTasks.length === 0) {
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
							var aIds = aSelectedTasks.map(function (item) {
								return item.id;
							});
		
							console.log("Selected IDs: ", aIds);
		
							// Kirim request DELETE dengan Axios
							const response = await axios.delete(Config.paths.apiBaseUrl + "/api/task/delete",  {
								data: aIds,
								headers: {
									"Content-Type": "application/json"
								}
							});
		
							console.log("Response: ", response);
		
							// Hapus data yang dihapus dari model
							var aRemainingTasks = aTask.filter(function (task) {
								return !aIds.includes(task.id);
							});
                            console.log("aRemainingTasks: ", aRemainingTasks);
							this.getView().getModel("view").setProperty("/tasks", aRemainingTasks);
		
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

        _openDialog: function (oData) {
			// Dapatkan referensi ke dialog
			console.log("oData : ",oData);
			var oView = this.getView();
			var oDialog = oView.byId("ProjectTaskDialog");
		
            
			// Jika dialog belum ada, buat dialog baru
			if (!oDialog) {
				oDialog = sap.ui.xmlfragment(oView.getId(), "sap.ui.bni.toolpageapp.view.fragments.ProjectTaskDialog", this);
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

        _loadProcessData: async function () {
            const fileResponse = await axios.get(Config.paths.apiBaseUrl +'/api/file');
		  
            const fileData = fileResponse.data;
            const filetableData = fileData.payloads.data;
        
            const files = filetableData.map(file => ({
              id: file.id,
              fileName: file.file_name
            }));
            console.log("Files:", files);
        
            // Langkah 3: Tambahkan data ke model "view"
            const oViewModel = this.getModel("view");
            if (oViewModel) {
              oViewModel.setProperty("/files", files);
            } else {
              console.error("View model not found.");
            }
        },

        // onSaveDialogTask: async function () {
        //      console.log("onSaveDialogTask");
        //     const oDialog = this.byId("ProjectTaskDialog");
        //     const titleValue = this.byId("titleInput") ? this.byId("titleInput").getValue() : "";
        //     const asOfDateValue = this.byId("asOfDateInput") ? this.byId("asOfDateInput").getValue() : "";
        //     const processDefComboValue = this.byId("processDefCombo") ? this.byId("processDefCombo").getSelectedKey() : "";
        //     const descriptionInputValue = this.byId("descriptionInput") ? this.byId("descriptionInput").getValue() : "";

        //     const processDefComboValueInt = parseInt(processDefComboValue, 10);
        //     console.log("titleValue :", titleValue);
        //     console.log("asOfDateValue :", asOfDateValue);
        //     console.log("processDefComboValueInt :", processDefComboValueInt);
        //     console.log("descriptionInputValue :", descriptionInputValue);

        //     // Validasi input
        //     if (!titleValue) {
        //         MessageToast.show("Please enter a title.");
        //         return;
        //     }
        //     if (!asOfDateValue) {
        //         MessageToast.show("Please select a date.");
        //         return;
        //     }
        //     if (!processDefComboValue) {
        //         MessageToast.show("Please select a process definition.");
        //         return;
        //     }

        //     // Ambil data dari model untuk menentukan mode Create atau Edit
        //     const oDialogModel = this.getView().getModel("dialogModel");
        //     const oDialogData = oDialogModel.getData();

        //     const requestData = {
        //         title: titleValue,
        //         as_of_date: asOfDateValue,
        //         process_definition: processDefComboValueInt,
        //         description: descriptionInputValue
        //     };

        //     // Jika ada `id` di data, maka ini operasi edit
        //     if (oDialogData && oDialogData.id) {
        //         requestData.id = oDialogData.id;
        //     }

        //     const oRequestBody = JSON.stringify(requestData);
        //     sap.ui.core.BusyIndicator.show(0);

        //     try {
        //         let oResponse;

        //         if (requestData.id) {
        //             // Edit data
        //             console.log("Editing data with ID:", requestData.id);
        //             oResponse = await axios.put(Config.paths.apiBaseUrl + `/api/task/${requestData.id}`, oRequestBody, {
        //                 headers: {
        //                     "Content-Type": "application/json"
        //                 }
        //             });
        //         } else {
        //             // Create data
        //             console.log("Creating new data");
        //             oResponse = await axios.post(Config.paths.apiBaseUrl + '/api/task', oRequestBody, {
        //                 headers: {
        //                     "Content-Type": "application/json"
        //                 }
        //             });
        //         }

        //         MessageToast.show("Data submitted successfully.");
        //         console.log("Response:", oResponse.data);
        //         oDialog.close();
        //         this.onRefresh();

        //     } catch (oError) {
        //         console.error("Error:", oError);
        //         MessageToast.show("Failed to submit data.");
        //     } finally {
        //         sap.ui.core.BusyIndicator.hide();
        //     }
        // },

        
        onSaveDialogTask: async function () {
            let idTask;
            console.log("onSaveDialogTask");
            const oDialog = this.byId("ProjectTaskDialog");
            const titleValue = this.byId("titleInput") ? this.byId("titleInput").getValue() : "";
            const asOfDateValue = this.byId("asOfDateInput") ? this.byId("asOfDateInput").getValue() : "";
            const processDefComboValue = this.byId("processDefCombo") ? this.byId("processDefCombo").getSelectedKey() : "";
            const descriptionInputValue = this.byId("descriptionInput") ? this.byId("descriptionInput").getValue() : "";

            const processDefComboValueInt = parseInt(processDefComboValue,10);
            console.log("titleValue :", titleValue);
            console.log("asOfDateValue :", asOfDateValue);
            console.log("processDefComboValueInt :", processDefComboValueInt);
            console.log("descriptionInputValue :", descriptionInputValue);

            // Validasi input
            if (!titleValue) {
                MessageToast.show("Please enter a title.");
                return;
            }
            if (!asOfDateValue) {
                MessageToast.show("Please select a date.");
                return;
            }
            if (!processDefComboValue) {
                MessageToast.show("Please select a process definition.");
                return;
            }

            const oDialogModel = this.getView().getModel("dialogModel");
            const oDialogData = oDialogModel.getData()

           

            if (oDialogData && oDialogData.id) {
                idTask = oDialogData.id;
            }
        

            try {
                // const oResponse = await axios.post(Config.paths.apiBaseUrl + '/api/task', oRequestBody, {
                //     headers: {
                //         "Content-Type": "application/json" 
                //     }
                // });

                let oResponse;
                let requestData;
                let oRequestBody;

                if (idTask) {
                    // Edit data
                    requestData = {
                        title: titleValue,
                        as_of_date: asOfDateValue,
                        process_definition: parseInt(processDefComboValue, 10), 
                        description: descriptionInputValue,
                        id: idTask
                    };
        
                    oRequestBody =  JSON.stringify(requestData); 
                    sap.ui.core.BusyIndicator.show(0);
                    console.log("Editing data with ID:", idTask);
                    oResponse = await axios.put(Config.paths.apiBaseUrl + `/api/task/${requestData.id}`, oRequestBody, {
                        headers: {
                            "Content-Type": "application/json"
                        }
                    });
                    MessageToast.show("Add data successfully.");
                } else {
                    // Create data

                    requestData = {
                        title: titleValue,
                        as_of_date: asOfDateValue,
                        process_definition: parseInt(processDefComboValue, 10), 
                        description: descriptionInputValue
                    };
        
                    oRequestBody =  JSON.stringify(requestData); 
                    sap.ui.core.BusyIndicator.show(0);
                    console.log("Creating new data");
                    oResponse = await axios.post(Config.paths.apiBaseUrl + '/api/task', oRequestBody, {
                        headers: {
                            "Content-Type": "application/json"
                        }
                    });
                    MessageToast.show("Update data successfully.");
                }
                
                
                console.log("Response:", oResponse.data);
                oDialog.close();
                this.onRefresh();

                
                

            } catch (oError) {
                console.error("Error:", oError);
                MessageToast.show("Failed to save data.");
            } finally {
                sap.ui.core.BusyIndicator.hide();
            }
        },

        

        // onSaveDialogTask: async function () {
		// 	const oDialog = this.byId("ProjectTaskDialog");
		// 	const oFileUploader = this.byId("fileUploader");
		
		// 	// Ambil elemen input file
		// 	const oDomRef = oFileUploader.getDomRef();
		// 	const oFileInput = oDomRef && oDomRef.querySelector("input[type='file']");
		
		// 	if (!oFileInput || !oFileInput.files || oFileInput.files.length === 0) {
		// 		sap.m.MessageToast.show("Please select a file to upload.");
		// 		return;
		// 	}
		
		// 	const oFile = oFileInput.files[0];
		// 	console.log("Selected file:", oFile);
		
		// 	// Validasi jenis file
		// 	const sFileName = oFile.name.toLowerCase();
		// 	if (!sFileName.endsWith(".xls") && !sFileName.endsWith(".xlsx")) {
		// 		sap.m.MessageToast.show("Invalid file type. Please upload an Excel file.");
		// 		return;
		// 	}
		
		// 	try {
		// 		sap.ui.core.BusyIndicator.show(0);
		
		// 		const oFormData = new FormData();
		// 		oFormData.append("payload", JSON.stringify({ path: "text" }));
		// 		oFormData.append("files", oFile);
		
		// 		const sApiUrl = "http://nexia-main.pypsak.cloud/api/file";
		// 		const oResponse = await axios.post(sApiUrl, oFormData, {
		// 			headers: {
		// 				"Content-Type": "multipart/form-data",
		// 			},
		// 		});
		
		// 		sap.m.MessageToast.show("File uploaded successfully.");
		// 		console.log("Upload response:", oResponse.data);
		
		// 		oDialog.close();
		// 		//console.log("event : ",oEvent.data)
		// 		this._initializeAsyncData();
		// 	} catch (oError) {
		// 		console.error("Error uploading file:", oError);
		// 		sap.m.MessageToast.show("Failed to upload file.");
		// 	} finally {
		// 		sap.ui.core.BusyIndicator.hide();
		// 	}
		// },
		
        onCancelDialogTask: function () {
            // Tutup dialog
            this.getView().byId("ProjectTaskDialog").close();
        },

		onAfterRendering: function() {
			this.oProcessFlow1.bindElement("/");
		},

		
		onNodePress: function(event) {
			const nodeId = event.getParameters().getNodeId();  // Get the ID of the clicked node
			const oModel = this.getView().getModel();  // Get the model
		
			// Get the current nodes data from the model
			const nodes = oModel.getProperty("/nodes");
            console.log("node:", nodes);
		
			// Find the node by its ID in the model data
			const nodeIndex = nodes.findIndex(node => node.code === nodeId);
		
			if (nodeIndex !== -1) {
				console.log("index:", nodeIndex);
                const oDialog = new sap.m.Dialog({
                    title: "Choose Action",
                    content: new sap.m.Text({ text: "Do you want to run " + nodes[nodeIndex].label +"?" }),
                    buttons: [
                        new sap.m.Button({
                            text: "Run",
                            icon: "sap-icon://play",
                            press: () => {
                                this.runNode(nodes[nodeIndex].id, nodes[nodeIndex].label)    ;
                                oDialog.close(); // Close the dialog
                            }
                        }),
                        new sap.m.Button({
                            type: sap.m.ButtonType.Emphasized,
                            text: "Cancel",
                            icon: "sap-icon://cancel",
                            press: () => {
                                oDialog.close(); // Close the dialog
                            }
                        })
                    ]});
                    oDialog.open(); // Open the dialog
        } else {
				MessageToast.show("Node not found.");
			}
		},
        
        getAccessToken: async function() {
            try {
                // Step 1: Base64 encode client_id and client_secret
                const clientId = 'clientid';
                const clientSecret = 'secret';
                const encodedCredentials = btoa(`${clientId}:${clientSecret}`);  // Base64 encode

                // Step 2: Fetch OAuth token with client credentials in the Authorization header
                const oauthResponse = await fetch('http://nexia-main.pypsak.cloud/token', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Authorization': `Basic ${encodedCredentials}`  // Add the Authorization header
                    },
                    body: new URLSearchParams({
                        'grant_type': 'password',
                        'username': 'raymond',
                        'password': 'zbZX16}+'
                    })
                });

                if (!oauthResponse.ok) {
                    throw new Error('Failed to fetch OAuth token');
                }

                const oauthData = await oauthResponse.json();
                const accessToken = oauthData.access_token; // Store the access token
                console.log("OauthData: ",oauthData);
                console.log("OAuth Access Token:", accessToken);

                return accessToken // Return the access token
            } catch (error) {
                console.error("Error fetching access token:", error);
                throw new Error("Failed to retrieve access token.");
            }
        },

	});
});