const { contextBridge, ipcRenderer, shell } = require("electron");
const { readFileSync } = require("fs");
const { join } = require("path");
const {
  START_NOTIFICATION_SERVICE,
  NOTIFICATION_SERVICE_STARTED,
  NOTIFICATION_SERVICE_ERROR,
  NOTIFICATION_RECEIVED,
  TOKEN_UPDATED,
} = require ('electron-push-receiver/src/constants');
const { SENDER_ID } = require("../../config");
const { EVENTS } = require("../../events");

contextBridge.exposeInMainWorld("electron", {
  getFCMToken: (channel, func) => {
    ipcRenderer.once(channel, func);
    ipcRenderer.send("getFCMToken");
  },
  openInBrowser: (url) => shell.openExternal(url),
  getAppVersion: () => {
    return ipcRenderer.sendSync("getAppVersion");
  }
});
window.addEventListener("DOMContentLoaded", () => {
  const rendererScript = document.createElement("script");
  rendererScript.text = readFileSync(join(__dirname, "script.js"), "utf8");
  document.body.appendChild(rendererScript);
});

contextBridge.exposeInMainWorld("ipcRenderer", {
  send: (channel, data) => {
    ipcRenderer.send(channel, data);
  },
  on: (channel, func) => {
    ipcRenderer.on(channel, (event, ...args) => func(...args));
  },
  off: (channel, func) => {
    ipcRenderer.removeListener(channel, func);
    ipcRenderer.removeAllListeners(channel);
  },
});

ipcRenderer.on(NOTIFICATION_SERVICE_STARTED, (_, token) => {
  ipcRenderer.send(EVENTS.STORE_FCM_TOKEN, token)
})

// Handle notification errors
ipcRenderer.on(NOTIFICATION_SERVICE_ERROR, () => console.error)

// Send FCM token to backend
ipcRenderer.on(TOKEN_UPDATED, (_, token) => {
  ipcRenderer.send(EVENTS.STORE_FCM_TOKEN, token)
})

// Display notification
ipcRenderer.on(NOTIFICATION_RECEIVED, (_, serverNotificationPayload) => {
  if (serverNotificationPayload.data){
    ipcRenderer.send(EVENTS.SHOW_NOTIFICATION, serverNotificationPayload.data)
  }
})

// Start service
ipcRenderer.send(START_NOTIFICATION_SERVICE, SENDER_ID)


// 
const updateOnlineStatus = () => {
  if (ipcRenderer)
    ipcRenderer.send("NETWORK_STATUS", navigator.onLine ? "online" : "offline");
};
window.addEventListener("online", updateOnlineStatus);
window.addEventListener("offline", updateOnlineStatus);
updateOnlineStatus();
