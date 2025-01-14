sap.ui.define([
	'./BaseController',
	'sap/ui/model/json/JSONModel',
	'sap/ui/Device',
	'sap/ui/bni/toolpageapp/model/formatter'
], function (BaseController, JSONModel, Device, formatter) {
	"use strict";
	return BaseController.extend("sap.ui.bni.toolpageapp.controller.ProjectDetail", {
		formatter: formatter,

		//#region processflow
		onInit: async function () {
			var oViewModel = new JSONModel({
				isPhone : Device.system.phone
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

			// Step 3: Fetch nodes data from the API with OAuth token
			const nodesResponse = await fetch('http://nexia-main.pypsak.cloud/api/task_detail', {
				headers: {
					'Authorization': `Bearer ${accessToken}`  // Use Bearer token for authentication
				}
			});

			const taskData = await nodesResponse.json();
			const nodesData = taskData.payloads.data; // This is the array of tasks

			console.log("Raw Nodes Data:", nodesData);

			// Step 4: Fetch children relationships from the API with OAuth token
			const childrenResponse = await fetch('http://nexia-main.pypsak.cloud/api/task_transition', {
				headers: {
					'Authorization': `Bearer ${accessToken}`  // Use Bearer token for authentication
				}
			});
			const transitionData = await childrenResponse.json();
			const childrenData = transitionData.payloads.data;
			console.log("Children Data:", childrenData);

			// Map children relationships to nodes
			const childrenMap = {};
			childrenData.forEach(child => {
				const parentId = child.task_code_from;
				const childId = child.task_code_to;
				if (!childrenMap[parentId]) {
					childrenMap[parentId] = [];
				}
				childrenMap[parentId].push(childId);
			});
			// Process nodes, assign all to the same lane, and map their children

			const nodes = nodesData.map(node => ({
				id: node.id, // Node ID
				code: node.task_code, // Task code
				laneId: "lane", // Assign all nodes to the same lane
				label: node.task_name, // Task name, matches XML binding for `title`
				owner: node.owner, // Owner of the task
				customColumns: {
					command: {
						shellScript: node.custom_columns?.command?.shell_script || "", // Shell script
						sasScript: node.custom_columns?.command?.sas_script || "", // SAS script
						sasScriptParams: node.custom_columns?.command?.sas_script_params || "", // SAS script parameters
						sasLog: node.custom_columns?.command?.sas_log || "", // SAS log path
						sasPathPrint: node.custom_columns?.command?.sas_path_print || "", // SAS path print
					},
				},
				parameters: {
					currentVersion: node.parameters?.current_version || "", // Current version
					adjust: node.parameters?.adjust || "", // Adjust value
					startDate: node.parameters?.start_date || "", // Start date
					countdown: node.parameters?.countdown || "", // Countdown
					isShowCountdown: node.parameters?.is_show_countdown === "true", // Boolean for show countdown
				},
				results: {
					"script.log": node.results?.["script.log"] || "",
				},
				state: node.state,
				begin_at: node.process_begin_at,
				end_at: node.process_end_at,
				calculate:{
					begin_at: node?.process_begin_at ||"",
					end_at: node?.process_end_at || "",
				},
				iteration: node.iteration,
				children: childrenMap[node.task_code] || [], // Assign children if available
				description: node.description || "", // Task description, matches XML binding for `texts`
				highlighted: node.highlighted || false, // Highlighted state (default false if not present)
				focused: node.focused || false, // Focused state (default false if not present)
				isRunning: node.is_running || false, // Is task running (default false if null)
				createdAt: node.created_at, // Creation timestamp
				updatedAt: node.updated_at, // Update timestamp
				deletedAt: node.deleted_at, // Deletion timestamp
				createdBy: {
					userName: node.createdBy?.user_name || "", // Creator's username
					fullName: node.createdBy?.full_name || "", // Creator's full name
					email: node.createdBy?.email || "", // Creator's email
					clientCode: node.createdBy?.client_code || "", // Client code
					id: node.createdBy?.id || null, // Creator's ID
				},
				updatedBy: {
					userName: node.createdBy?.user_name || "", // Creator's username
					fullName: node.createdBy?.full_name || "", // Creator's full name
					email: node.createdBy?.email || "", // Creator's email
					clientCode: node.createdBy?.client_code || "", // Client code
					id: node.createdBy?.id || null, // Creator's ID
				}, // Updated by information
				task: {
					title: node.task?.title || "", // Task title
					asOfDate: node.task?.as_of_date || "", // Task as of date
					processDefinition: node.task?.process_definition || null, // Process definition
					description: node.task?.description || "", // Task description
					id: node.task?.id || null, // Task ID
				},
			}));

			// Set up the combined model for the view
			const combinedModel = new sap.ui.model.json.JSONModel({
				lanes: lanesData,
				nodes: nodes
			});
			oView.setModel(combinedModel);

			console.log("Initialization completed with model data:", combinedModel.getData());


			this.oProcessFlow1.setZoomLevel("Two");

		},

        onNew: function () {
			this._openDialog(); // Panggil fungsi untuk membuka dialog dalam mode New
		},

        _openDialog: function (oData) {
			// Dapatkan referensi ke dialog
			console.log("oData : ",oData);
			var oView = this.getView();
			var oDialog = oView.byId("excelUploadDialog");
		
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

		onAfterRendering: function() {
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

		runNode: async function(nodeId, nodeTitle) {
            try {
                // Step 1: Get the access token using the helper function
                const accessToken = await this.getAccessToken();
        
                // Step 2: Execute the node using the access token
                const apiUrl = `http://nexia-main.pypsak.cloud/api/task_detail/execute/${nodeId}`;
                const executeResponse = await fetch(apiUrl, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`,
                    },
                });
        
                if (!executeResponse.ok) {
                    throw new Error(`Execution failed: ${executeResponse.statusText}`);
                }
        
                const data = await executeResponse.json();
                console.log("Node execution response:", data);
        
                sap.m.MessageToast.show(`Process ${nodeTitle} executed successfully!`);

            } catch (error) {
                console.error("Error executing node:", error);
                sap.m.MessageToast.show("Failed to execute node.");
            }

        },
		//#endregion

		//#region formatter
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
            Show Countdown: ${parameters.isShowCountdown ? "Yes" : "No"}`;
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
        
            const seconds = Math.floor((timeDiff / 1000) % 60);
            const minutes = Math.floor((timeDiff / (1000 * 60)) % 60);
            const hours = Math.floor((timeDiff / (1000 * 60 * 60)) % 24);
            const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        
            let result = "";
            if (days > 0) {
                result += `${days} days `;
            }
            if (hours > 0) {
                result += `${hours} hours `;
            }
            if (minutes > 0) {
                result += `${minutes} minutes `;
            }
            result += `${seconds} seconds`;

            return result;
        },

        formatCustomColumns: function (customColumns) {
            if (!customColumns || !customColumns.command) {
                return "No command details available"; // Handle null or undefined command object
            }
            console.log(customColumns.command.shell_script)
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
            console.log("Sesuatu")
            // Format command data into a multi-line string
            return `${command.shell_script ? `Shell Script: ${command.shell_script}` : ""}
                    ${command.sas_script ? `SAS Script: ${command.sas_script}` : ""}
                    ${command.sas_script_params ? `SAS Script Params: ${command.sas_script_params}` : ""}
                    ${command.sas_log ? `SAS Log: ${command.sas_log}` : ""}
                    ${command.sas_path_print ? `SAS Path Print: ${command.sas_path_print}` : ""}`.trim();
        },

        formatUpperCase: function (sText) {
            return sText ? sText.toUpperCase() : ""; // Convert text to uppercase, handle null/undefined
        }
		//#endregion
	});
});