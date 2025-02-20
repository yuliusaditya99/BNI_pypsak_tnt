sap.ui.define([
	'./BaseController',
	'sap/ui/model/json/JSONModel',
	'sap/ui/Device',
	'sap/ui/bni/toolpageapp/model/formatter',
    'sap/ui/bni/toolpageapp/util/Config',
    'sap/m/MessageToast',
    'sap/m/MessageBox',
    "./Config.API"    
], function (BaseController, JSONModel, Device, formatter, Config, MessageToast, MessageBox, ConfigAPI) {
	"use strict";
	return BaseController.extend("sap.ui.bni.toolpageapp.controller.Project", {
		formatter: formatter,

		onInit: function () {
            this.appConfig = new ConfigAPI();
            var oViewModel = new JSONModel({
                isPhone: sap.ui.Device.system.phone
            });
            this.setModel(oViewModel, "view");
            var oDialogModel = new JSONModel({});
            var oDialogModel = new JSONModel({});
            this.setModel(oDialogModel, "dialogModel");
        
            //console.log("onInit executed successfully."); 
            //console.log("onInit executed successfully."); 
            this._initializeAsyncData();
            var oTable = this.byId("TableTask");
            if (oTable) {
                //console.log("TableTask found, attaching row selection event.");
                //console.log("TableTask found, attaching row selection event.");
                oTable.attachRowSelectionChange(this.onRowSelect.bind(this));
            } else {
                console.error("TableTask not found in the view.");
            }
        },

		_initializeAsyncData: async function () {
            this._selectedColumn = "title";
            this.getView().getModel("view").setProperty("/showProcessDefinitionId", false); 
			this.onGetTask(10).then((result) => {
                console.log("perpage:", result.perpage);
                console.log("Total Rows:", result.totalrow);
            });
			
		},

        // onAfterRendering: function () {
        //     console.log("masuk project controller 2");

        // },

        // onAfterRendering: function () {
        //     console.log("masuk project controller 2");

        // },

        onGetTask: async function(paramLength) {
            try {
                let taskResponse;
                let params;
                let url;
                const header = { "Content-Type": "application/json" };                      
                if (paramLength == "-1") {
                    //console.log("masuk -1");
                    params = { start: 0, length: 100000000, orders: "id", dirs: "desc" };
                    url = Config.paths.apiBaseUrl + '/api/task';
                } else {
                    //console.log("masuk 10");
                    params = { start: 0, length: paramLength, orders: "id", dirs: "desc" };
                    url = Config.paths.apiBaseUrl + '/api/task';
                }        
                taskResponse = await this.appConfig.allAPI("get", header, params, url);
                
                if (!taskResponse){
                    
                }
                else
                {
                    if (taskResponse.message == "Access denied") { 
                        MessageToast.show("Token expired.", { duration: 3000 });                   
                        const oView = this.getView();
                                    const oComponent = sap.ui.core.Component.getOwnerComponentFor(oView);
                                    const oRouter = oComponent.getRouter();
                                    console.log("Router:", oRouter);
                                    oRouter.navTo("login");
                    }   
                }                     
                console.log("taskResponse get :", taskResponse);        
                const tasktableData = taskResponse.payloads.data;
                const pageCount = taskResponse.payloads.per_page;
                const totalRowCount = taskResponse.payloads.total;        
                const tasks = tasktableData.map(task => ({
                    id: task.id,
                    title: task.title,
                    asOfDate: task.as_of_date,
                    processDefinitionId: task.process_definition,
                    processDefinition: task.file.file_name || "N/A",
                    description: task.description,
                    createdBy: task.createdBy?.user_name || "N/A",
                    createdAt: task.created_at,
                    updatedBy: task.updatedBy?.user_name || "N/A",
                    updatedAt: task.updated_at,
                }));
                //console.log("tasks:", tasks);        
                //console.log("tasks:", tasks);        
                const oViewModel = this.getModel("view");
                if (oViewModel) {
                    oViewModel.setProperty("/tasks", tasks);
                } else {
                    console.error("View model not found.");
                }        
                       
                return {
                    perpage: pageCount,
                    perpage: pageCount,
                    totalrow: totalRowCount
                };        
        
            } catch (error) {
                if (error.response) {
                    console.error("Error Response:", error.response.data);
                    console.error("Status:", error.response.status);
                    MessageToast.error("Error : " + error.response.data.message);
                    MessageToast.error("Error : " + error.response.data.message);
                } else if (error.request) {
                    console.error("Error Request:", error.request);
                    MessageToast.error("Can not connect the server.");
                    MessageToast.error("Can not connect the server.");
                } else {
                    console.error("Error Message:", error.message);
                    MessageToast.error("Error Undifine");
                    MessageToast.error("Error Undifine");
                }
            }
        },        

        onNew: function () {
            const dialogModel = this.getView().getModel("dialogModel");
            console.log("Masuk New");
            this._loadProcessData();
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
            this._loadProcessData();
            var oTable = this.byId("TableTask"); 
            var aSelectedIndices = oTable.getSelectedIndices(); 
        
            console.log("aSelectedIndices: ", aSelectedIndices);
            if (!aSelectedIndices || aSelectedIndices.length === 0) {
                MessageToast.show("No selected data to edit."); 
                return;
            }

            if (aSelectedIndices.length > 1) {
                MessageToast.show("Please select only one row to edit.");
                return;
            }
        
            var oModel = this.getView().getModel("view");
            //var aTasks = oModel.getProperty("/tasks"); 
        
            var aSelectedTasks = aSelectedIndices.map(function (iIndex) {
                var oContext = oTable.getContextByIndex(iIndex); 
                return oContext ? oContext.getObject() : null; 
            }).filter(function (oTask) {
                return oTask !== null;
            });
        
            console.log("Selected tasks: ", aSelectedTasks);
        
            if (aSelectedTasks.length === 1) {
                var oSelectedData = aSelectedTasks[0];
                console.log("oSelectedData:", oSelectedData);
                var oDialogModel = this.getView().getModel("dialogModel");
                oDialogModel.setData(oSelectedData);                
                oDialogModel.setProperty("/processDefinitionId", oSelectedData.processDefinitionId);                
                this.byId("ProjectTaskDialog").open();
            } else {
                MessageToast.show("Please select only one row to edit."); 
            }
        },
        
        
        onRefresh: function () {
            console.log("masuk refresh");
			this._initializeAsyncData().then(() => {
                console.log("after _initializeAsyncData");
				var oViewModel = this.getModel("view");
				if (oViewModel) {
					oViewModel.refresh(true); 
				}
                var oTable = this.byId("TableTask");  
                if (oTable) {
                    oTable.clearSelection();
                }
                var oBinding = oTable.getBinding("rows");
                oBinding.filter([]);
			}).catch((error) => {
				console.error("Error during refresh:", error);
			});
		},

        onColumnChange: function (oEvent) {
			var sSelectedKey = oEvent.getSource().getSelectedKey();
			this._selectedColumn = sSelectedKey;
		},

        onTitleChange: function () {
            console.log("rubah tittle");
            var oModel = this.getView().getModel("dialogModel");
            oModel.setProperty("/titleState", "None");
            oModel.setProperty("/titleErrorText", "");
		},

        onProcessChange: function () {
            console.log("rubah Process");
            var oModel = this.getView().getModel("dialogModel");
            oModel.setProperty("/processState", "None");
            oModel.setProperty("/processErrorText", "");
		},

        onAsOfDateChange: function () {
            console.log("rubah As Of Date");
            var oModel = this.getView().getModel("dialogModel");
            oModel.setProperty("/asOfDateState", "None");
            oModel.setProperty("/asOfDateErrorText", "");
		},

        onRowCountChange: async function (oEvent) {
            let countPerPage;
            let countTotal;
        
            console.log("Masuk onRowCountChange");
            const sSelectedKey = oEvent.getSource().getSelectedKey();
            const oTable = this.byId("TableTask");
            console.log("oTable 1 : ", oTable);
            console.log("sSelectedKey : ", sSelectedKey);
        
            // Tunggu hasil dari onGetTask
            const result = await this.onGetTask(sSelectedKey);
            countPerPage = result.perpage;
            countTotal = result.tasks;
            console.log("countTotal : ", countTotal);
            console.log("countPerPage : ", countPerPage);
        },
        
        onSearch: function (oEvent) {
            var sQuery = oEvent.getSource().getValue();
            var oTable = this.byId("TableTask");
            var oBinding = oTable.getBinding("rows");

            console.log("this._selectedColumn : ", this._selectedColumn);
            if (this._selectedColumn === "asOfDate" || this._selectedColumn === "createdAt" || this._selectedColumn === "updatedAt") {
                console.log("sQuery : ", sQuery);
                if (sQuery) {
                    var oFilter = new sap.ui.model.Filter(this._selectedColumn, sap.ui.model.FilterOperator.Contains, sQuery);
                    oBinding.filter([oFilter]);
                } else {
                    oBinding.filter([]);
                }
            } else {
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
            const header = {  "Content-Type": "application/json" };
            var oTable = this.byId("TableTask"); 
            var aSelectedIndices = oTable.getSelectedIndices(); 
            console.log("aSelectedIndices: ", aSelectedIndices);
            if (!aSelectedIndices || aSelectedIndices.length === 0) {
                MessageToast.show("No selected data to delete."); 
                return;
            }
            
            var oModel = this.getView().getModel("view");
            var aTasks = oModel.getProperty("/tasks"); 

            var aSelectedTasks = aSelectedIndices.map(function (iIndex) {
                var oContext = oTable.getContextByIndex(iIndex); 
                return oContext ? oContext.getObject() : null;
            }).filter(function (oTask) {
                return oTask !== null; 
            });

            console.log("Selected tasks: ", aSelectedTasks);
			MessageBox.confirm("Are you sure you want to delete the selected data?", {
				actions: [MessageBox.Action.YES, MessageBox.Action.NO],
				onClose: async function (sAction) {
					if (sAction === MessageBox.Action.YES) {
						try {
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
							var aRemainingTasks = aTasks.filter(function (task) {
								return !aIds.includes(task.id);
							});
                            console.log("aRemainingTasks: ", aRemainingTasks);
							this.getView().getModel("view").setProperty("/tasks", aRemainingTasks);
		
							// Refresh tabel
							// var oTable = this.byId("detailedTable");
							// if (oTable) {
							// 	oTable.getBinding("items").refresh();
							// }	
							
                            this.onRefresh();
		
							// Tampilkan notifikasi
							if (response.data.error) {
								sap.m.MessageToast.show(response.data.message, { duration: 3000 });
							} else {
								MessageToast.show("Data deleted successfully.", { duration: 3000 });
							}
						} catch (error) {
							// Tangani error dari Axios
							if (error.response) {
								sap.m.MessageToast.show("Error: " + error.response.data.message, { duration: 3000 });
							} else {
								MessageToast.show("An unexpected error occurred.", { duration: 3000 });
							}
						}
					}
				}.bind(this)
			});
            //this.onRefresh();
		},

        onCellClick: function (oEvent) {
            // Log the full event parameters to inspect available data
            console.log("Event Parameters:", oEvent.getParameters());
        
            var oTable = this.byId("TableTask");
            var iRowIndex = oEvent.getParameter("rowIndex"); // Get row index
        
            console.log("Row Index:", iRowIndex);
        
            if (iRowIndex !== undefined) {
                var oModel = this.getView().getModel("view");
                var aRows = oModel.getProperty("/tasks");
                var oRowData = aRows[iRowIndex]; // Retrieve data by index
                
                // Navigate using router
                this._navigateToTaskDetail(oRowData.id);
                localStorage.setItem("taskId", oRowData.id);
                console.log("Navigating to ProjectDetail with ID:", oRowData.id);
            } else {
                MessageToast.show("No valid row index found!");
            }
        },

        onRowSelect: function (oEvent) {
            console.log("masuk select row");
            var oSelectedRowContext = oEvent.getParameter("rowContext");
            var aTask = this.getView().getModel("view").getProperty("/tasks");
            var aSelectedTasks = aTask.filter(function (task) {
                return task.selected === true;
            });
        
            var aIds = aSelectedTasks.map(function (item) {
                return item.id;
            });
        
            console.log("Selected IDs: ", aIds);
            console.log("aSelectedTasks: ", aSelectedTasks);
            if (oSelectedRowContext) {
                var oModel = this.getView().getModel("view");
                var oRowData = oModel.getProperty(oSelectedRowContext.getPath());

                // Lakukan navigasi ke halaman detail dengan data baris
                var oRouter = UIComponent.getRouterFor(this);
                oRouter.navTo("ProjectDetail", {
                    projectId: oRowData.id // Pastikan ID unik tersedia dalam data baris
                });
            } else {
                MessageToast.show("No row selected!");
            }
        },       
        
        _navigateToTaskDetail: function (sTaskId) {
            if (!sTaskId) {
                MessageToast.show("Task ID is missing.");
                return;
            }
        
            // Simulate navigation (replace with real routing logic)
            MessageToast.show("Navigating to Task Detail for Task ID: " + sTaskId);
            localStorage.setItem("taskId", sTaskId);
            // Example: Use router to navigate to a task detail page
            this.getRouter().navTo("TaskDetail", { taskId: sTaskId });
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
            const fileResponse = await axios.get(Config.paths.apiBaseUrl +'/api/file?start=0&length=100000000&orders=id&dirs=desc');
		  
            const fileData = fileResponse.data;
            const filetableData = fileData.payloads.data;
        
            const files = filetableData.map(file => ({
              id: file.id,
              fileName: file.file_name
            }));
            console.log("Files:", files);
            const oViewModel = this.getModel("view");
            if (oViewModel) {
              oViewModel.setProperty("/filename", files);
            } else {
              console.error("View model not found.");
            }
        },

            
        onSaveDialogTask: async function () {
            let idTask;
            console.log("onSaveDialogTask");
            const oDialog = this.byId("ProjectTaskDialog");
            const titleValue = this.byId("titleInput") ? this.byId("titleInput").getValue() : "";
            const asOfDateValue = this.byId("asOfDateInput") ? this.byId("asOfDateInput").getValue() : "";
            const processDefComboValue = this.byId("processDefCombo") ? this.byId("processDefCombo").getSelectedKey() : "";
            const descriptionInputValue = this.byId("descriptionInput") ? this.byId("descriptionInput").getValue() : "";
            const oDialogModel = this.getView().getModel("dialogModel");
            const oDialogData = oDialogModel.getData()

            const processDefComboValueInt = parseInt(processDefComboValue,10);
            // console.log("titleValue :", titleValue);
            // console.log("asOfDateValue :", asOfDateValue);
            // console.log("processDefComboValueInt :", processDefComboValueInt);
            // console.log("descriptionInputValue :", descriptionInputValue);

            if (!titleValue) {
                oDialogModel.setProperty("/titleState", "Error");
                oDialogModel.setProperty("/titleErrorText", "Title is required!");
            }
            if (!asOfDateValue) {
                oDialogModel.setProperty("/asOfDateState", "Error");
                oDialogModel.setProperty("/asOfDateErrorText", "Date is required!");
            }
            if (!processDefComboValue) {
                oDialogModel.setProperty("/processState", "Error");
                oDialogModel.setProperty("/processErrorText", "Process Definition is required!");
            }           

            if (oDialogData && oDialogData.id) {
                idTask = oDialogData.id;
            }
            console.log("idTask : ",idTask);

            try {
 
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
                  

                    if (requestData.description === "") {
                        delete requestData.description;
                    }
                    console.log("requestData : ",requestData);
                    oRequestBody =  JSON.stringify(requestData); 
                    sap.ui.core.BusyIndicator.show(0);
                    console.log("Editing data with ID:", idTask);
                    oResponse = await axios.put(Config.paths.apiBaseUrl + `/api/task/${requestData.id}`, oRequestBody, {
                        headers: {
                            "Content-Type": "application/json"
                        }
                    });

                    console.log("oResponse.error : ",oResponse.data.error);
                    if(oResponse.data.error==true)
                    {
                        MessageToast.show("Failed Update Data : ",oResponse.data.message);
                    }
                    else
                    {
                        MessageToast.show("Update data successfully.");
                    }
                    
                } else {
                    // Create data

                    requestData = {
                        title: titleValue,
                        as_of_date: asOfDateValue,
                        process_definition: parseInt(processDefComboValue, 10), 
                        description: descriptionInputValue
                    };

                    if (requestData.description === "") {
                        delete requestData.description;
                    }
                    console.log("requestData.description : ",requestData.description);
                    oRequestBody =  JSON.stringify(requestData); 
                    sap.ui.core.BusyIndicator.show(0);
                    console.log("Creating new data");
                    oResponse = await axios.post(`${Config.paths.apiBaseUrl}/api/task`, oRequestBody, {
                        headers: {
                            "Content-Type": "application/json"
                        }
                    });

                    // oResponse = await axios.post(`${Config.paths.apiBaseUrl}/api/user`, payload, {
					// 	headers: {
					// 		"Content-Type": "application/json"
					// 	}
					// });
                    
                  

                    console.log("oResponse.error : ",oResponse.data.error);
                    if(oResponse.data.error==true)
                    {
                        //oError.response.data.detail[0].msg
                        MessageToast.show("Failed Add Data : ",oResponse.data.message);
                    }
                    else
                    {
                        MessageToast.show("Add data successfully.");
                    }
                
                }
                
                
                console.log("Response:", oResponse.data);
                oDialog.close();
                this.onRefresh();                

            } 
            catch (oError) {
                console.error("oError :", oError);
                console.error("oError.response :", oError.response);
            
                if (oError.response) {
                    // Akses status dan pesan error dari response
                    console.error("Error status:", oError.response.status);
            
                    if (oError.response.data && Array.isArray(oError.response.data)) {
                        // Jika respons adalah array JSON (seperti yang Anda tunjukkan)
                        const errorMessage = oError.response.data.map(err => err.msg).join(", ");
                        console.error("Error messages:", errorMessage);
                        sap.m.MessageToast.show("Error: " + errorMessage, { duration: 3000 });
                    } else if (oError.response.data.message) {
                        // Jika ada pesan error langsung
                        console.error("Error message:", oError.response.data.message);
                        sap.m.MessageToast.show("Error: " + oError.response.data.message, { duration: 3000 });
                    } else {
                        // Default jika format data tidak diketahui
                        console.error("Error response data:", oError.response.data);
                        sap.m.MessageToast.show("An error occurred.", { duration: 3000 });
                    }
                } else {
                    // Error lain seperti masalah jaringan
                    console.error("Unexpected error:", oError);
                    sap.m.MessageToast.show("An unexpected error occurred.", { duration: 3000 });
                }
            }
            finally {
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

		

        onSortColumn: function (oEvent) {
            console.log("masuk SortColumn");
            const oTable = oEvent.getSource(); 
            const oBinding = oTable.getBinding("rows"); 
            const oColumn = oEvent.getParameter("column");
            const sSortProperty = oColumn.getSortProperty(); 
            const sSortOrder = oColumn.getSortOrder(); 
        
            if (!sSortProperty) {
                return;
            }
        
            // Toggle Sort Order
            const bDescending = sSortOrder === "Descending";
            const oSorter = new sap.ui.model.Sorter(sSortProperty, bDescending);
        
            // Terapkan Sorting
            oBinding.sort(oSorter);
        
            // Perbarui tampilan arah sort di header
            oColumn.setSortOrder(bDescending ? "Ascending" : "Descending");
        }

        

	});
});