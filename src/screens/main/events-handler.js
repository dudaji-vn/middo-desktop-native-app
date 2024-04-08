const {
  app,
  ipcMain,
  nativeImage,
  shell,
  systemPreferences,
  desktopCapturer,
  Notification,
} = require("electron");
const log = require("electron-log");
const { APP_URL, IS_MAC } = require("../../config");
const { EVENTS } = require("../../events");
const getParentPath = require("../../utils/get-parent-path");
let myNotification;
function handleEvent(screen) {
  ipcMain.on(EVENTS.GOOGLE_LOGIN, (_) => {
    shell.openExternal(APP_URL + "/login-google-electron");
  });

  ipcMain.on(EVENTS.GET_SCREEN_SOURCE, async (e) => {
    // Check permission
    if (systemPreferences.getMediaAccessStatus) {
      const permissionStatus = systemPreferences.getMediaAccessStatus("screen");
      if (permissionStatus !== "granted") {
        shell.openExternal(
          "x-apple.systempreferences:com.apple.preference.security?Privacy_ScreenCapture"
        );
      }
    }
    const sources = await desktopCapturer.getSources({
      types: ["window", "screen"],
      thumbnailSize: {
        width: 1280,
        height: 720,
      },
    });
    sources.forEach((source) => {
      source.thumbnail = source.thumbnail.toDataURL();
    });
    e.sender.send(EVENTS.GET_SCREEN_SOURCE, sources);
  });

  
  // Event for drag able bar
  ipcMain.on(EVENTS.TOGGLE_MIC, () => {
    screen.webContents.send(EVENTS.TOGGLE_MIC);
  });
  ipcMain.on(EVENTS.TOGGLE_CAMERA, () => {
    screen.webContents.send(EVENTS.TOGGLE_CAMERA);
  });
  ipcMain.on(EVENTS.STOP_SHARE, () => {
    screen.webContents.send(EVENTS.STOP_SHARE);
  });

  // NOTIFICATION
  ipcMain.on(EVENTS.SHOW_NOTIFICATION, (e, data) => {
    const isFocused = screen.isFocused();
    if (myNotification) {
      myNotification.close();
    }
    log.info("Got notification", data);
    let currentPathName = new URL(screen.webContents.getURL())?.pathname;
    const { title, body, url } = data;
    let notifyPathName = new URL(url)?.pathname;
    if (currentPathName == notifyPathName && isFocused) return;
    if (!isFocused) {
      if (IS_MAC) {
        app?.dock?.bounce();
        app?.dock?.setBadge("•");
      } else {
        screen.setOverlayIcon(
          nativeImage.createFromPath(
            getParentPath(__dirname, 2) + "/assets/badge.png"
          ),
          "New notification"
        );
      }
    }
    myNotification = new Notification({
      title,
      body,
      icon: getParentPath(__dirname, 2) + "/assets/icon.png",
      // silent: false,
      // timeoutType: "default",
      // urgency: "normal",
    });
    myNotification.on("click", () => {
      screen.webContents.send("OPEN_URL", url);
      screen.show();
      screen.focus();
      myNotification.close();
    });
    myNotification.show();
  });
}
module.exports = handleEvent;
