const { contextBridge, ipcRenderer } = require("electron");
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