const { ipcMain } = require("electron");
const { EVENTS } = require("./events");
const Store = require("electron-store");
const DoodleScreen = require("./screens/doodle");
require('events').EventEmitter.defaultMaxListeners = 15;
function globalEvents() {
  const store = new Store();
  let doodleScreen = null;
  ipcMain.on(EVENTS.SHARE_SCREEN_SUCCESS, (e, args) => {
    doodleScreen = new DoodleScreen(args);
  });

  ipcMain.on(EVENTS.STOP_SHARE_SCREEN, () => {
    if (doodleScreen) {
      doodleScreen.destroy();
      doodleScreen = null;
    }
  });
  // Notification FCM Setup
  ipcMain.on(EVENTS.STORE_FCM_TOKEN, (e, token) => {
    store.set("fcm_token", token);
  });
  ipcMain.on("getFCMToken", async (e) => {
    e.sender.send("getFCMToken", store.get("fcm_token"));
  });
}

module.exports = globalEvents;
