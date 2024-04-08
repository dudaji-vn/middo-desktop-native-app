const { ipcMain, app } = require("electron");
const { EVENTS } = require("./events");
const Store = require("electron-store");
const createDooleScreen = require("./screens/doodle");
require('events').EventEmitter.defaultMaxListeners = 15;
function globalEvents() {
  const store = new Store();
  ipcMain.on(EVENTS.SHARE_SCREEN_SUCCESS, (e, args) => {
    createDooleScreen(args)
  });

  // Notification FCM Setup
  ipcMain.on(EVENTS.STORE_FCM_TOKEN, (e, token) => {
    store.set("fcm_token", token);
  });
  ipcMain.on("getFCMToken", async (e) => {
    e.sender.send("getFCMToken", store.get("fcm_token"));
  });
  ipcMain.on("getAppVersion", (e) => {
    e.returnValue = app.getVersion();
  });
}

module.exports = globalEvents;
