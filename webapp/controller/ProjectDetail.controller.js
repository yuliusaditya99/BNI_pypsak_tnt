sap.ui.define([
	'./BaseController',
	'sap/ui/model/json/JSONModel',
	'sap/ui/Device',
	'sap/ui/bni/toolpageapp/model/formatter'
], function (BaseController, JSONModel, Device, formatter) {
	"use strict";
	return BaseController.extend("sap.ui.bni.toolpageapp.controller.ProjectDetail", {
		formatter: formatter,

		//#region PROCCESS FLOW
        
        onInit: async function () {
            try{
            console.log("Project controller initialized.");
            var oViewModel = new JSONModel({
                isPhone: Device.system.phone
            });
            this.setModel(oViewModel, "view");
            Device.media.attachHandler(function (oDevice) {
                this.getModel("view").setProperty("/isPhone", oDevice.name === "Phone");
            }.bind(this));
            
            var oView = this.getView();
            this.oProcessFlow1 = oView.byId("processflow1");
            
            // Define a single lane with the ID "lane"
            const lanesData = [
                { laneId: "lane", label: "Single Lane", position: 0 }
            ];
            
            // Fetch OAuth token and data
            const nodesData = await this.fetchNodes();
            console.log("process initialitaion running");

            const childrenData = await this.fetchChildren();
            console.log("Nodes data:", nodesData);

            const nodes = this.mapNodes(nodesData, childrenData);
            
            const combinedModel = new sap.ui.model.json.JSONModel({
                lanes: lanesData,
                nodes: nodes
            });
            oView.setModel(combinedModel);
        
        
            console.log("Initialization completed with model data:", combinedModel.getData());
        
            this.oProcessFlow1.setZoomLevel("Two");
            
           
            this._initializeWebSocket();
            // Continue with the rest of the initialization logic
            console.log("Process initialization running");
            
        } catch (error) {
            console.error("Error during onInit:", error);
            sap.m.MessageToast.show("Initialization failed.");
        }
        },
        
        mapNodes: function (nodesData, childrenData) {
            // Create a mapping of parent-to-children relationships
            const childrenMap = {};
            childrenData.forEach(child => {
                const parentId = child.task_code_from;
                const childId = child.task_code_to;
                if (!childrenMap[parentId]) {
                    childrenMap[parentId] = [];
                }
                childrenMap[parentId].push(childId);
            });
        
            return nodesData.map(node => {
                // Map state to state_color
                let stateColor;
                switch (node.state) {
                    case "Running":
                        stateColor = "Neutral";
                        break;
                    case "Error":
                        stateColor = "Negative";
                        break;
                    case "Completed":
                        stateColor = "Positive";
                        break;
                    default:
                        stateColor = "Neutral"; // Default color if state is undefined or unrecognized
                }
        
                return {
                    id: node.id,
                    code: node.task_code,
                    laneId: "lane",
                    label: node.task_name,
                    owner: node.owner,
                    customColumns: {
                        command: {
                            shellScript: node.custom_columns?.command?.shell_script || "",
                            sasScript: node.custom_columns?.command?.sas_script || "",
                            sasScriptParams: node.custom_columns?.command?.sas_script_params || "",
                            sasLog: node.custom_columns?.command?.sas_log || "",
                            sasPathPrint: node.custom_columns?.command?.sas_path_print || "",
                        },
                    },
                    parameters: {
                        currentVersion: node.parameters?.current_version || "",
                        adjust: node.parameters?.adjust || "",
                        startDate: node.parameters?.start_date || "",
                        countdown: node.parameters?.countdown || "",
                        isShowCountdown: node.parameters?.is_show_countdown || "",
                    },
                    results: {
                        "script.log": node.results?.["script.log"] || "",
                    },
                    state: node.state, // Original state
                    stateColor: stateColor, // Mapped state color
                    begin_at: node.process_begin_at,
                    end_at: node.process_end_at,
                    calculate: {
                        begin_at: node?.process_begin_at || "",
                        end_at: node?.process_end_at || "",
                    },
                    iteration: node.iteration,
                    children: childrenMap[node.task_code] || [],
                    description: node.description || "",
                    highlighted: node.highlighted || false,
                    focused: node.focused || false,
                    isRunning: node.is_running || false,
                    createdAt: node.created_at,
                    updatedAt: node.updated_at,
                    deletedAt: node.deleted_at,
                    createdBy: {
                        userName: node.createdBy?.user_name || "",
                        fullName: node.createdBy?.full_name || "",
                        email: node.createdBy?.email || "",
                        clientCode: node.createdBy?.client_code || "",
                        id: node.createdBy?.id || null,
                    },
                    updatedBy: {
                        userName: node.createdBy?.user_name || "",
                        fullName: node.createdBy?.full_name || "",
                        email: node.createdBy?.email || "",
                        clientCode: node.createdBy?.client_code || "",
                        id: node.createdBy?.id || null,
                    },
                    task: {
                        title: node.task?.title || "",
                        asOfDate: node.task?.as_of_date || "",
                        processDefinition: node.task?.process_definition || null,
                        description: node.task?.description || "",
                        id: node.task?.id || null,
                    },
                };
            });
        },
        
        _initializeWebSocket: function () {

            this._webSocket = new WebSocket(localStorage.getItem("websocet"));
        
            this._webSocket.onopen = () => {
                console.log("WebSocket connection established.");
                this._webSocket.send(JSON.stringify({ action: "subscribe", type: "nodes_updates" }));
            };
            this._webSocket.onmessage = (event) => {
                try {
                    // Parse the event data as JSON
                    const data = event.data;
                    // Check if it contains 'task_detail'
                    if (typeof data === "string" && data.includes("task_detail")) {
                        // console.log("task_detail found in data:", data);
                        console.log("data : ", event.data);
                        
                        // refresh the data and view
                        this.onRefresh();
                        
                    }
                } catch (error) {
                    console.error("Failed to process WebSocket message:", error);
                }

            };
        
            this._webSocket.onclose = () => {
                console.log("WebSocket connection closed. Reconnecting...");
                setTimeout(() => this._initializeWebSocket(), 5000); // Reconnect after 5 seconds
            };
        
            this._webSocket.onerror = (error) => {
                console.error("WebSocket error:", error);
            };
        },
        
        fetchNodes: async function () {
            try {
                const token = localStorage.getItem("authToken");
                if (!token) {
                    throw new Error("No auth token found");
                }
        
                const params = {
                    search: "",  
                    columns: "", 
                    start: 0, 
                    length: 10,
                    orders: "task_code",
                    dirs: "asc",
                    id: localStorage.getItem("taskId")
                };

                // Make the API request with query parameters
                const response = await axios.get('http://nexia-main.pypsak.cloud/api/task_detail', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    params: params 
                });
        
                const data = response.data;
                return data.payloads.data;  // Adjust as necessary based on the API response structure
            } catch (error) {
                console.error("Error fetching nodes:", error);
                throw error;
            }
        },
        
        
        fetchChildren: async function () {
            try {
                const token = localStorage.getItem("authToken");
                if (!token) {
                    throw new Error("No auth token found");
                }

                const params = {
                    search: "",  
                    columns: "", 
                    start: 0, 
                    length: 10,
                    orders: "task_code",
                    dirs: "asc",
                    id: localStorage.getItem("taskId")
                };
        
                const response = await axios.get('http://nexia-main.pypsak.cloud/api/task_transition', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }, 
                    params: params 
                });
        
                const data = response.data;
                return data.payloads.data;
            } catch (error) {
                console.error("Error fetching children:", error);
                throw error;
            }
        },
        
        onAfterRendering: function () {
            this.oProcessFlow1.bindElement("/");
        },

        onZoomIn: function() {
            this.oProcessFlow1.zoomIn();
            MessageToast.show("Zoom level changed to: " + this.oProcessFlow1.getZoomLevel());
        },

        onZoomOut: function() {
            this.oProcessFlow1.zoomOut();
            MessageToast.show("Zoom level changed to: " + this.oProcessFlow1.getZoomLevel());
        },
		
		onNodePress: function (event) {
            const nodeId = event.getParameters().getNodeId();
            const oModel = this.getView().getModel();
            const nodes = oModel.getProperty("/nodes");
        
            const nodeIndex = nodes.findIndex(node => node.code === nodeId);
        
            if (nodeIndex !== -1) {
                const node = nodes[nodeIndex];

                const dialogData = {
                    label: node.label, // For the dialog title
                    parameters: {
                        currentVersion: node.parameters?.currentVersion || null,
                        adjust: node.parameters?.adjust || null,
                        startDate: node.parameters?.startDate || null,
                        countdown: node.parameters?.countdown || null,
                        isShowCountdown: node.parameters?.isShowCountdown || null
                    }
                };

                console.log("Dialog Parameters:", dialogData.parameters); // Check values
        
                if (!this._oDialog) {
                    this._oDialog = sap.ui.xmlfragment(this.getView().getId(), "sap.ui.bni.toolpageapp.fragments.NodeDialog", this);
                    this.getView().addDependent(this._oDialog);
                }
                
                const oDialogModel = new sap.ui.model.json.JSONModel(dialogData);
                this._oDialog.setModel(oDialogModel, "dialogModel");
        
                this._currentNodeId = node.id;
                this._currentNodeTitle = node.label;
        
                this._oDialog.open();
            } else {
                sap.m.MessageToast.show("Node not found.");
            }
        },
        
        onRunPress: function() {
            //#region  !!!!!
            const oDialogModel = this._oDialog.getModel("dialogModel");
            const dialogData = oDialogModel.getData();
            const parameters = dialogData.parameters;
            
            const allFieldsEmpty = 
            (!parameters.currentVersion || parameters.currentVersion.trim() === "") &&
            (!parameters.adjust || parameters.adjust.trim() === "") &&
            (!parameters.startDate || parameters.startDate.trim() === "") &&
            (!parameters.countdown || parameters.countdown === 0) &&
            (!parameters.isShowCountdown || parameters.isShowCountdown.trim() === "");
            //#endregion
            
            if (allFieldsEmpty) {
                // Make parameters empty if all fields are blank and isShowCountdown is false
                this.runNode(this._currentNodeId, this._currentNodeTitle, {});
                
            } else{
                this.runNode(this._currentNodeId, this._currentNodeTitle, parameters);
                
            }
        
            this._oDialog.close(); // Close the dialog
        },

        onCancelPress: function() {
            this._oDialog.close(); // Close the dialog
        },

		runNode: async function(nodeId, nodeTitle, parameters) {
            try {
                sap.ui.core.BusyIndicator.show(0);

                const accessToken = localStorage.getItem('authToken');
            
                // Step 2: Prepare the API request
                const apiUrl = `http://nexia-main.pypsak.cloud/api/task_detail/execute/${nodeId}`;
                const payload = {};
            
                if (parameters.currentVersion && parameters.currentVersion.trim() !== "") {
                    payload.current_version = parameters.currentVersion;
                }
                if (parameters.adjust !== null && parameters.adjust !== undefined) {
                    payload.adjust = parameters.adjust;
                }
                if (parameters.startDate && parameters.startDate.trim() !== "") {
                    payload.start_date = parameters.startDate;
                }
                if (parameters.countdown !== null && parameters.countdown !== undefined) {
                    payload.countdown = parameters.countdown;
                }
                if (parameters.isShowCountdown !== null && parameters.isShowCountdown !== undefined) {
                    payload.is_show_countdown = parameters.isShowCountdown;
                }
            
                // Execute API call
                const response = await fetch(apiUrl, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`,
                    },
                    body: JSON.stringify(payload)
                });
            
                if (!response.ok) {
                    throw new Error(`Execution failed: ${response.statusText}`);
                }
            
                const data = await response.json();
                console.log("Node execution response:", data);
                sap.m.MessageToast.show(data.message);
                // Show success message
                sap.m.MessageToast.show(`Process ${nodeTitle} is running`);
                
        
            } catch (error) {
                console.error("Error executing node:", error);
                sap.m.MessageToast.show("Failed to execute node.");
            } finally{
                sap.ui.core.BusyIndicator.hide();
            }
        },

        onRefresh: async function () {
            try {
                // Re-fetch nodes and children data
                const nodesData = await this.fetchNodes();
                const childrenData = await this.fetchChildren();
        
                // Map updated nodes
                const updatedNodes = this.mapNodes(nodesData, childrenData);
        
                // Update the model with refreshed data
                const oModel = this.getView().getModel();
                oModel.setProperty("/nodes", updatedNodes);
                oModel.refresh(true);
        
                // sap.m.MessageToast.show("Data refreshed successfully.");
            } catch (error) {
                console.error("Error during refresh:", error);
                // sap.m.MessageToast.show("Failed to refresh data.");
            }
        },

        // onCellClick: function (oEvent) {
        //     // Log the full event parameters to inspect available data
        //     console.log("Event Parameters:", oEvent.getParameters());
        
        //     var oTable = this.byId("nodesTableProjectDetail");
        //     var iRowIndex = oEvent.getParameter("rowIndex"); // Get row index
        
        //     console.log("Row Index:", iRowIndex);
        
        //     if (iRowIndex !== undefined) {
        //         var oModel = this.getView().getModel("view");
        //         var aRows = oModel.getProperty("/tasks");
        //         var oRowData = aRows[iRowIndex]; // Retrieve data by index
        
        //         // Navigate using router
        //         this._navigateToTaskDetail(oRowData.id);
        //         localStorage.setItem("taskId", oRowData.id);
        //         console.log("Navigating to ProjectDetail with ID:", oRowData.id);
        //     } else {
        //         sap.m.MessageToast.show("No valid row index found!");
        //     }
        // },
        
        onCellClick: function (oEvent) {
            try {
                // Log the event parameters
                console.log("Event Parameters:", oEvent.getParameters());
        
                // Get the row index
                const iRowIndex = oEvent.getParameter("rowIndex");
                console.log("Row Index:", iRowIndex);
        
                // Retrieve the model and check its validity
                const oModel = this.getView().getModel("view");
                if (!oModel) {
                    throw new Error("View model is not found.");
                }
        
                // Get nodes array and validate it
                const nodes = oModel.getProperty("/nodes");
                console.log("Nodes Array:", nodes);
                if (!Array.isArray(nodes) || nodes.length === 0) {
                    throw new Error("Nodes array is empty or not an array.");
                }
        
                // Ensure the row index is valid
                if (iRowIndex < 0 || iRowIndex >= nodes.length) {
                    throw new Error(`Row index ${iRowIndex} is out of bounds.`);
                }
        
                // Retrieve node data
                const node = nodes[iRowIndex];
                console.log("Selected Node Data:", node);
        
                if (node && node.id) {
                    // Open the dialog or navigate as needed
                    const dialogData = {
                        label: node.label, // Dialog title
                        parameters: {
                            currentVersion: node.parameters?.currentVersion || null,
                            adjust: node.parameters?.adjust || null,
                            startDate: node.parameters?.startDate || null,
                            countdown: node.parameters?.countdown || null,
                            isShowCountdown: node.parameters?.isShowCountdown || null
                        }
                    };
        
                    console.log("Dialog Parameters:", dialogData.parameters);
        
                    if (!this._oDialog) {
                        this._oDialog = sap.ui.xmlfragment(this.getView().getId(), "sap.ui.bni.toolpageapp.fragments.NodeDialog", this);
                        this.getView().addDependent(this._oDialog);
                    }
        
                    const oDialogModel = new sap.ui.model.json.JSONModel(dialogData);
                    this._oDialog.setModel(oDialogModel, "dialogModel");
        
                    this._currentNodeId = node.id;
                    this._currentNodeTitle = node.label;
        
                    this._oDialog.open();
                } else {
                    sap.m.MessageToast.show("No valid node data found.");
                }
            } catch (error) {
                console.error("Error in onCellClick:", error.message);
                sap.m.MessageToast.show("An error occurred while processing the cell click.");
            }
        }
        ,
        
        
        
        
		//#endregion

		//#region FORMATTER
		formatParameters: function (parameters) {
            if (!parameters) {
                return "No parameters available"; // Handle null or undefined parameters
            }
            // Check if all fields are empty
            const isEmpty = 
                !parameters.currentVersion && 
                !parameters.adjust && 
                !parameters.startDate && 
                !parameters.countdown && 
                !parameters.isShowCountdown;
        
            if (isEmpty) {
                return "";
            }

        
            // Format parameters into a multi-line string
            return `Current Version: ${parameters.currentVersion || ""}
            Adjust: ${parameters.adjust || ""}
            Start Date: ${parameters.startDate || ""}
            Countdown: ${parameters.countdown || ""}
            Show Countdown: ${parameters.isShowCountdown||""}`;
        },
        
        timeFormater: function (dateString) {
            if (!dateString) {
                return ""; // Return empty string if no date is provided
            }
        
            const date = new Date(dateString); // Convert to a Date object
            if (isNaN(date)) {
                return dateString; // Return the original value if the date is invalid
            }
        
            // Get day, month, year, and time
            const day = String(date.getDate()).padStart(2, "0");
            const monthNames = [
                "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
            ];
            const month = monthNames[date.getMonth()]; // Get month name
            const year = date.getFullYear();
            const hours = String(date.getHours()).padStart(2, "0");
            const minutes = String(date.getMinutes()).padStart(2, "0");
            const seconds = String(date.getSeconds()).padStart(2, "0");
        
            return `${day} ${month} ${year} ${hours}:${minutes}:${seconds}`;
        },

        calculateProcessTime: function (task) {
            // Extract the begin_at and end_at from the task object
            const start = task?.begin_at;
            const end = task?.end_at;
        
            // If either date is missing, return an empty string or a placeholder
            if (!start || !end) {
                return "";
            }
        
            const startDate = new Date(start);
            const endDate = new Date(end);
        
            if (isNaN(startDate) || isNaN(endDate)) {
                return "Invalid dates";
            }
        
            const timeDiff = endDate - startDate;
        
            if (timeDiff < 0) {
                return "End time is earlier than start time";
            }
        
            // Calculate hours, minutes, and seconds
            const totalSeconds = Math.floor(timeDiff / 1000);
            const hours = Math.floor(totalSeconds / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = totalSeconds % 60;
        
            // Format the result to always display hours, minutes, and seconds
            return `${hours}h ${minutes}m ${seconds}s`;
        },
        
        formatCustomColumns: function (customColumns) {
            if (!customColumns || !customColumns.command) {
                return "No command details available"; // Handle null or undefined command object
            }
            // Check if all fields are empty
            const isEmpty = 
                !customColumns.command.shell_script &&
                !customColumns.command.sas_script &&
                !customColumns.command.sas_script_params &&
                !customColumns.command.sas_log &&
                !customColumns.command.sas_path_print;
        
            if (isEmpty) {
                return ""; // Return empty if all fields are empty
            }
            
            // Format command data into a multi-line string
            return `${command.shell_script ? `Shell Script: ${command.shell_script}` : ""}
                    ${command.sas_script ? `SAS Script: ${command.sas_script}` : ""}
                    ${command.sas_script_params ? `SAS Script Params: ${command.sas_script_params}` : ""}
                    ${command.sas_log ? `SAS Log: ${command.sas_log}` : ""}
                    ${command.sas_path_print ? `SAS Path Print: ${command.sas_path_print}` : ""}`.trim();
        },

        formatUpperCase: function (sText) {
            return sText ? sText.toUpperCase() : ""; // Convert text to uppercase, handle null/undefined
        },

        falseIfNull: function(value) {
            // If the value is null, undefined, or empty, return false; otherwise, return the value
            return value === "true" || value === true ? true : false;
        },
        
        emptyIfNull: function (value) {
            return value || "";
        },
        
		//#endregion
	});
});