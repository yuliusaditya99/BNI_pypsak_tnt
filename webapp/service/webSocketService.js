sap.ui.define([], function () {
    "use strict";

    return class WebSocketService {
        constructor(url) {
            this.url = url;
            this._webSocket = null;
        }

        initializeWebSocket() {
            this._webSocket = new WebSocket(this.url);

            this._webSocket.onopen = () => {
                console.log("WebSocket connection established.");
                this._webSocket.send(JSON.stringify({ action: "subscribe", type: "nodes_updates" }));
            };

            this._webSocket.onmessage = (event) => {
                console.log("Message received: ", event.data);
            };

            this._webSocket.onclose = () => {
                console.log("WebSocket connection closed. Reconnecting...");
                setTimeout(() => this.initializeWebSocket(), 5000);
            };

            this._webSocket.onerror = (error) => {
                console.error("WebSocket error:", error);
            };
        }

        sendMessage(message) {
            if (this._webSocket && this._webSocket.readyState === WebSocket.OPEN) {
                this._webSocket.send(message);
            } else {
                console.error("WebSocket is not open. Cannot send message.");
            }
        }

        closeConnection() {
            if (this._webSocket) {
                this._webSocket.close();
            }
        }
    };
});
