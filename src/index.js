Object.defineProperty(exports, "__esModule", { value: true });
var socket = {};
var io = require("socket.io-client");
function establishConnection(
  socket_url,
  serviceIdentifier,
  channelCustomerIdentifier,
  callback
) {
  try {
    if (this.socket !== undefined && this.socket.connected) {
      console.log("Resuming Existing Connection");
      eventListeners((data) => {
        callback(data);
      });
    } else {
      if (socket_url !== "") {
        console.log("Starting New Connection");
        let origin = new URL(socket_url).origin;
        let path = new URL(socket_url).pathname;
        this.socket = io(origin, {
          path: path == "/" ? "" : path + "/socket.io",
          auth: {
            serviceIdentifier: serviceIdentifier,
            channelCustomerIdentifier: channelCustomerIdentifier,
          },
        });
        eventListeners((data) => {
          callback(data);
        });
      }
    }
  } catch (error) {
    callback(error);
  }
}
exports.establishConnection = establishConnection;
function eventListeners(callback) {
  this.socket.on("connect", () => {
    if (this.socket.id != undefined) {
      console.log(`you are connected with socket:`, this.socket);
      let error = localStorage.getItem("widget-error");
      if (error) {
        callback({ type: "SOCKET_RECONNECTED", data: this.socket });
      } else {
        callback({ type: "SOCKET_CONNECTED", data: this.socket });
      }
    }
  });
  this.socket.on("CHANNEL_SESSION_STARTED", (data) => {
    console.log(`Channel Session Started Data: `, data);
    callback({ type: "CHANNEL_SESSION_STARTED", data: data });
  });
  this.socket.on("MESSAGE_RECEIVED", (message) => {
    console.log(`MESSAGE_RECEIVED received: `, message);
    callback({ type: "MESSAGE_RECEIVED", data: message });
  });
  this.socket.on("disconnect", (reason) => {
    console.error(`Connection lost with the server: `, reason);
    callback({ type: "SOCKET_DISCONNECTED", data: reason });
  });
  this.socket.on("connect_error", (error) => {
    console.log(
      `unable to establish connection with the server: `,
      error.message
    );
    localStorage.setItem("widget-error", "1");
    callback({ type: "CONNECT_ERROR", data: error });
  });
  this.socket.on("CHAT_ENDED", (data) => {
    console.log(`CHAT_ENDED received: `, data);
    callback({ type: "CHAT_ENDED", data: data });
    this.socket.disconnect();
  });
  this.socket.on("ERRORS", (data) => {
    console.error(`ERRORS received: `, data);
    callback({ type: "ERRORS", data: data });
  });
}
exports.eventListeners = eventListeners;

function chatRequest(data) {
  try {
    if (data) {
      let additionalAttributesData = [];
      let webChannelDataObj = {
        key: "WebChannelData",
        type: "WebChannelData",
        value: {
          browserDeviceInfo: data.data.browserDeviceInfo,
          queue: data.data.queue,
          locale: data.data.locale,
          formData: data.data.formData,
        },
      };
      additionalAttributesData.push(webChannelDataObj);
      let obj = {
        channelCustomerIdentifier: data.data.channelCustomerIdentifier,
        serviceIdentifier: data.data.serviceIdentifier,
        additionalAttributes: additionalAttributesData,
      };
      this.socket.emit("CHAT_REQUESTED", obj);
      console.log(`SEND CHAT_REQUESTED DATA:`, obj);
    }
  } catch (error) {
    throw error;
  }
}

exports.chatRequest = chatRequest;
