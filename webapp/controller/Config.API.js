sap.ui.define([
    "sap/ui/base/Object",
    "sap/m/BusyDialog",    
    "sap/m/BusyDialog",    
    "../util/Config"
], function (UI5Object, BusyDialog, Config) {
    "use strict";

    return UI5Object.extend("sap.ui.bni.toolpageapp.controller.Config.API", {
        constructor: function () {
            this.busyDialog = new BusyDialog();
        },

        showLoading: function () {
            this.busyDialog.open();
        },

        hideLoading: function () {
            this.busyDialog.close();
        },
        
        login: async function (credentials) {
            axios.defaults.headers.common["Authorization"] = "Bearer " + localStorage.getItem("authToken");
            axios.defaults.headers.common["Access-Control-Allow-Origin"] = "*";
            try {
                this.showLoading();
                console.log("Starting login process with credentials:", credentials);
                console.log("URL :", Config.paths.apiBaseUrl + "/api/login");
                
                const response = await axios.post(Config.paths.apiBaseUrl + "/api/login", credentials, { timeout: 400000 });
                console.log("response X :", response);
                const token = response.data.payloads.token;
                const user = response.data.payloads.user;
                const id = user.id;
                const webSocket = response.data.payloads.ws + "/ws/" + id;
                const userNameLogin  = JSON.parse(JSON.stringify(user));
                

                console.log("Token:", token);
                console.log("WebSocket URL:", webSocket);
                
                
                if (typeof Storage !== "undefined") {
                    localStorage.setItem("authToken", token);
                    localStorage.setItem("user", JSON.stringify(user));
                    localStorage.setItem("userNameLogin", userNameLogin.user_name);
                    localStorage.setItem("userNameLogin", userNameLogin.user_name);
                    localStorage.setItem("websocet", webSocket);
                }
        
                axios.defaults.headers.common["Authorization"] = "Bearer " + token;
                axios.defaults.headers.common["Access-Control-Allow-Origin"] = "*";
                axios.defaults.headers.common["msi-content-access"] = true;                
                axios.defaults.headers.common["X-CSRF-TOKEN"] = $("meta[name='csrf-token']").attr("content");
                //axios.defaults.withCredentials = true;
                return response.data;
            } catch (error) {
                console.error("Login error:", error);
                throw error;
            } finally {
                this.hideLoading();
            }
        },
        
        // putAPI: async function (type, header, url) {
        //     if (!type) {
        //         console.error("Error: API request type is missing.");
        //         return null;
        //     }
        //     console.log("masuk put api");
        
        //     try {
        //         const body = {
        //             title: "test9",
        //             as_of_date: "2025-02-14",
        //             process_definition: 2,
        //             id: 62,
        //             created_by: 1,
        //             updated_by: 1,
        //             created_at: "2025-02-14T16:15:03",
        //             updated_at: "2025-02-15T23:39:30",
        //             createdBy: {
        //                 user_name: "admin",
        //                 full_name: null,
        //                 email: null,
        //                 client_code: null,
        //                 id: 1
        //             },
        //             updatedBy: {
        //                 user_name: "admin",
        //                 full_name: null,
        //                 email: null,
        //                 client_code: null,
        //                 id: 1
        //             },
        //             file: {
        //                 path: "main/src/storages/text",
        //                 file_name: "BNI_Template_1_1739441554.573675.xlsx",
        //                 content_type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        //                 extension: "xlsx",
        //                 size_bytes: 12809,
        //                 id: 34
        //             }
        //         };
        
        //         console.log("body API:", body);
        //         console.log("header API:", header);
        //         console.log("url API:", url);
                
        //         const token = localStorage.getItem("authToken");
        
        //         if (this.isJWTExpired(token)) {
        //             console.error("Token expired. Please log in again.");
        //             return null;
        //         }
        
        //         if (!header) {
        //             header = {};
        //         }
        //         if (!header.Authorization && token) {
        //             header.Authorization = "Bearer " + token;
        //         }
        
        //         const config = {
        //             method: type.toLowerCase(),
        //             url,
        //             headers: header,
        //             data: type.toLowerCase() === "get" ? null : body
        //         };
        
        //         console.log("config:", config);
        //         const response = await axios(config);
        //         console.log("response:", response.data);
        
        //         return response.data;
        //     } 
        //     catch (error) {
        //         if (error.response) {
        //             console.log("Response Error:", error.response.status);
        //             console.log("Response Data:", error.response.data);
        //             sap.m.MessageToast.show(error.response.data[0]?.msg || "Terjadi kesalahan.");
        //         } else if (error.request) {
        //             console.log("No response received:", error.request);
        //             sap.m.MessageToast.show("Tidak ada respons dari server.");
        //         } else {
        //             console.log("Error:", error.message);
        //             sap.m.MessageToast.show("Terjadi kesalahan jaringan.");
        //         }
        //     }
        // },        

        allAPI: async function (type, header, body, url) {
            if (!type) {
                console.error("Error: API request type is missing.");
                return null;
            }
        
            try {
                console.log("body API:", body);
                console.log("header API:", header);
                console.log("url API:", url);
                const token = localStorage.getItem("authToken");
        
                if (this.isJWTExpired(token)) {
                    console.error("Token expired. Please log in again.");
                    //sap.m.MessageBox.error("Token expired. Please log in again."); // Menampilkan error di UI
                    return null;
                }
        
                if (!header) {
                    header = {};
                }
                if (!header.Authorization && token) {
                    header.Authorization = "Bearer " + token;
                }
                const config = {
                    method: type.toLowerCase(),
                    url,
                    headers: header
                };

                if (type.toLowerCase() === "get") {
                    config.params = body;
                } else {
                    config.data = body;
                }
                sap.ui.core.BusyIndicator.show(0);
                console.log("config:", config);
                const response = await axios(config);
                console.log("response:", response.data);
                console.log("body setri : ",JSON.stringify(body))
                sap.ui.core.BusyIndicator.hide();

                if(JSON.stringify(body) === "{}")
                {
                    return response; 
                }
                else
                {
                    return response.data; 
                }
                
            } 
            catch (error) {
                // console.log("API Request Error:", error);
                // console.log("API Request Error response:", error.response);
                // console.log("API Request Error request:", error.request);
                // console.log("API Request Error message:", error.message);
                // if (error.response && error.response.data.detail) {
                //     console.log("error detail:", error.response.data.detail[0].msg);
                //     //sap.m.MessageBox.error("Error: " + error.response.data.detail[0].msg); // Tampilkan error dari API
                // } else {
                //     sap.m.MessageBox.error("Terjadi kesalahan saat menghubungi server.");
                // }
                if (error.response) {
                    // Server merespons dengan status error (4xx, 5xx)
                    console.log("Response Error:", error.response.status);
                    console.log("Response Data:", error.response.data);
                    //return error.response.data;
                    if (Array.isArray(error.response.data)) {
                        return error.response.data[0]; 
                    } else {
                        return error.response.data;
                    }
                    
                    // Menampilkan pesan error ke UI
                    //sap.m.MessageToast.show(error.response.data[0]?.msg || "Terjadi kesalahan.");
                } else if (error.request) {
                    // Request dikirim tapi tidak ada respons dari server
                    console.log("No response received:", error.request);
                    return error.request;                    
                    //sap.m.MessageToast.show("Tidak ada respons dari server.");
                } else {
                    // Kesalahan lainnya
                    console.log("Error:", error.message);
                    return error.message;
                    //sap.m.MessageToast.show("Terjadi kesalahan jaringan.");
                }
            }
        }, 

        // allAPI: async function (type, header, body, url) {
        //     if (!type) {
        //         console.error("Error: API request type is missing.");
        //         return null;
        //     }        

      
        //     console.log("body API:", body);
        //     console.log("header API:", header);
        //     console.log("Set Header 2:", axios.defaults.headers.common["Access-Control-Allow-Origin"]);
        //     console.log("url API:", url);
        //     const token = localStorage.getItem("authToken");
            
    
        //     if (this.isJWTExpired(token)) {
        //         console.error("Token expired. Please log in again.");
        //         //sap.m.MessageBox.error("Token expired. Please log in again."); // Menampilkan error di UI
        //         return null;
        //     }
    
        //     if (!header) {
        //         header = {};
        //     }
        //     if (!header.Authorization && token) {
        //         header.Authorization = "Bearer " + token;
        //     }
        //     const config = {
        //         method: type.toLowerCase(),
        //         url,
        //         headers: header
        //     };

        //     if (type.toLowerCase() === "get") {
        //         config.params = body;
        //     } else {
        //         config.data = body;
        //     }
    
        //     console.log("config:", config);
        //     const response = await axios(config);
        //     console.log("response:", response.data);
        //     console.log("response ori:", response);
        //     console.log("body setri : ",JSON.stringify(body))

        //     if(JSON.stringify(body) === "{}")
        //     {
        //         return response; 
        //     }
        //     else
        //     {
        //         return response.data; 
        //     }           
        // }, 
        
		downloadFile: async function (url, header, filename = 'downloaded_file') {
            try {
                sap.ui.core.BusyIndicator.show(0);
                console.log("url API:", url);
                console.log("header API:", header);
    
                // Ambil token dari localStorage
                const token = localStorage.getItem("authToken");
    
                // Cek apakah token expired
                if (this.isJWTExpired(token)) {
                    console.error("Token expired. Please log in again.");
                    sap.m.MessageBox.error("Sesi telah habis, silakan login kembali.");
                    return null;
                }
    
                // Buat header jika tidak ada
                if (!header) {
                    header = {};
                }
    
                // Tambahkan Authorization hanya jika belum ada
                if (!header.Authorization && token) {
                    header.Authorization = "Bearer " + token;
                }
    
                // Konfigurasi request untuk file download
                const config = {
                    method: 'get',
                    url,
                    headers: header,
                    responseType: 'blob' // Menggunakan blob agar bisa langsung didownload
                };
    
                const response = await axios(config);
                console.log("response download axio :",response);
    
                // Buat URL blob
                const blob = new Blob([response.data], { type: response.headers['content-type'] });
                const downloadUrl = URL.createObjectURL(blob);
    
                // Buat elemen <a> untuk download file
                const link = document.createElement('a');
                link.href = downloadUrl;
                link.setAttribute('download', filename);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
    
                console.log(`File "${filename}" successfully download`);
                sap.ui.core.BusyIndicator.hide();
                return downloadUrl+"/"+filename;
               
                }
                catch (error) {
                    sap.ui.core.BusyIndicator.hide();
                    if (error.response) {
                        // Server merespons dengan status error (4xx, 5xx)
                        console.log("Response Error:", error.response.status);
                        console.log("Response Data:", error.response.data);
                        //return error.response.data;
                        if(error.response.status = "400")
                        {
                            return error.response.status;
                        }
                        else
                        {
                            if (Array.isArray(error.response.data)) {
                                return error.response.data[0]; 
                            } else {
                                return error.response.data;
                            }
                        }
                        
                        
                        // Menampilkan pesan error ke UI
                        //sap.m.MessageToast.show(error.response.data[0]?.msg || "Terjadi kesalahan.");
                    } else if (error.request) {
                        // Request dikirim tapi tidak ada respons dari server
                        console.log("No response received:", error.request);
                        return error.request;                    
                        //sap.m.MessageToast.show("Tidak ada respons dari server.");
                    } else {
                        // Kesalahan lainnya
                        console.log("Error:", error.message);
                        return error.message;
                        //sap.m.MessageToast.show("Terjadi kesalahan jaringan.");
                    }
                }
        },

        // Logout
        logout: async function (oRoute) {
            console.log("masuk logout");
            try {
                const token = localStorage.getItem("authToken");
                //const response = await axios.post(Config.paths.apiBaseUrl + "/api/auth/logout");
                const requestData = {
                    token: token
                };              

                console.log("requestData : ",requestData);
                const oRequestBody =  JSON.stringify(requestData); 
                sap.ui.core.BusyIndicator.show(0);
                const oResponse = await axios.post(Config.paths.apiBaseUrl + "/api/logout", oRequestBody, {
                    headers: {
                        "Content-Type": "application/json"
                    }
                });

               // console.log("oResponse.error : ",oResponse.data.error);
                console.log("response Logout :", oResponse);
                localStorage.removeItem("authToken");
                localStorage.removeItem("userNameLogin");
                localStorage.removeItem("user");
                
                sap.ui.core.BusyIndicator.hide();
                return oResponse;
            } catch (error) {
                sap.ui.core.BusyIndicator.hide();
                //MessageBox.error("Error logging out.");
            }
        },

        isJWTExpired: function (token) {
            if (!token) return true;

            const tokenNow = localStorage.getItem("authToken");
            console.log("tokenNow : ",tokenNow);
            if(tokenNow != "")
            {
                axios.defaults.headers.common["Authorization"] = "Bearer " + tokenNow;
        
                try {
                    
                    const parts = token.split(".");
                    if (parts.length !== 3) return true; 
            
                    const payload = JSON.parse(atob(parts[1]));
            
                    const now = Math.floor(Date.now() / 1000);
            
                    return payload.exp < now; // True jika token sudah kedaluwarsa
                } catch (e) {
                    console.error("Gagal mendekode token:", e);
                    return true;
                }
            }
            else
            {
                return true;
            }
        }
    });
});
