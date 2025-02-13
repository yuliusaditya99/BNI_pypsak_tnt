sap.ui.define([
    "sap/ui/base/Object",
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

        // // Load App Config
        // loadConfig: async function () {
        //     try {
        //         this.showLoading();
        //         const response = await axios.get("/config_ui");
        //         const config = response.data;

        //         this.appName = config.app_name;
        //         this.token = config.token;
        //         localStorage.setItem("authToken", this.token);
        //     } catch (error) {
        //         MessageBox.error("Failed to load configuration.");
        //     } finally {
        //         this.hideLoading();
        //     }
        // },

        
        login: async function (credentials) {
            axios.defaults.headers.common["Authorization"] = "Bearer " + localStorage.getItem("authToken");
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
                    localStorage.setItem("websocet", webSocket);
                }
        
                axios.defaults.headers.common["Authorization"] = "Bearer " + token;
                return response.data;
            } catch (error) {
                console.error("Login error:", error);
                throw error;
            } finally {
                this.hideLoading();
            }
        },
        
        // allAPI: async function (type, header, body, url) {
        //     if (!type) {
        //         //MessageToast.show("Error: API request type is missing.");
        //         return null;
        //     }            
        //     try {
        //         console.log("body API : ",body);
        //         console.log("header API : ",header);
        //         console.log("header url : ",url);
        //         // Gunakan axios dengan method dinamis
        //         const config = {
        //             method: type.toLowerCase(),
        //             url,
        //             headers: header
        //         };
        
        //         // GET menggunakan `params`, lainnya pakai `data`
        //         if (type.toLowerCase() === "get") {
        //             config.params = body;
        //         } else {
        //             config.data = body;
        //         }
        //         console.log("config : ",config);
        //         const response = await axios(config);
        //         console.log("response : ",response.data);
        //         return response.data; // Langsung kembalikan data dari API

        //     } catch (error) {
        //         console.log("error :",);
        //         console.error("API Request Error:", error);
        //         console.log("error :",error.response.data.detail[0].msg);
        //         //MessageBox.error(`API Error: ${error.message}`);
        //         return null;
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
        
                console.log("config:", config);
                const response = await axios(config);
                console.log("response:", response.data);
                console.log("body setri : ",JSON.stringify(body))
                
                if(JSON.stringify(body) === "{}")
                {
                    return response; 
                }
                else
                {
                    return response.data; 
                }
                
            } catch (error) {
                console.error("API Request Error:", error);
                if (error.response && error.response.data.detail) {
                    console.log("error detail:", error.response.data.detail[0].msg);
                    sap.m.MessageBox.error("Error: " + error.response.data.detail[0].msg); // Tampilkan error dari API
                } else {
                    sap.m.MessageBox.error("Terjadi kesalahan saat menghubungi server.");
                }

                    
            }
        }, 
        
		downloadFile: async function (url, header, filename = 'downloaded_file') {
            try {
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
    
                console.log(`File berhasil diunduh dengan nama "${filename}".`);
                return downloadUrl+"/"+filename;
    
            } catch (error) {
                return error;
            }
        },

        // Logout
        logout: async function () {
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
                //MessageToast.show("Logged out successfully.");
                //window.location.href = "/login";
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
