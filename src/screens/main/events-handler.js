const { app, ipcMain, nativeImage, shell, systemPreferences, desktopCapturer, Notification } = require("electron");
const path = require('path')
const { APP_URL, IS_MAC } = require("../../config");
const { EVENTS } = require("../../events");
const getParentPath = require("../../utils/get-parent-path");
let myNotification;
class EventHandler {
  constructor(screen) {
    this.screen = screen;
    this.listenEvent();
    this.notificationEvent();
  }

  listenEvent() {
    ipcMain.on(EVENTS.GOOGLE_LOGIN, (_) => {
      shell.openExternal(APP_URL + "/login-google-electron");
    });

    ipcMain.on(EVENTS.GET_SCREEN_SOURCE, async (e) => {
      // Check permission
      if (systemPreferences.getMediaAccessStatus) {
        const permissionStatus =
          systemPreferences.getMediaAccessStatus("screen");
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
      this.screen.webContents.send(EVENTS.TOGGLE_MIC);
    });
    ipcMain.on(EVENTS.TOGGLE_CAMERA, () => {
      this.screen.webContents.send(EVENTS.TOGGLE_CAMERA);
    });
    ipcMain.on(EVENTS.STOP_SHARE, () => {
      this.screen.webContents.send(EVENTS.STOP_SHARE);
    });
  }

  notificationEvent() {
    ipcMain.on(EVENTS.SHOW_NOTIFICATION, (e, data) => {
      const isFocused = this.screen.isFocused();
      let currentPathName = new URL(this.screen.webContents.getURL())?.pathname;
      const { title, body, url } = data;
      let notifyPathName = new URL(url)?.pathname;
      if (currentPathName == notifyPathName && isFocused) return;
      if (!isFocused) {
        if (IS_MAC) {
          app?.dock?.bounce();
          app?.dock?.setBadge("•");
        } else {
          this.screen.setOverlayIcon(
            nativeImage.createFromPath(getParentPath(__dirname, 2) + "/assets/badge.png"),
            "New notification"
          );
        }
      }
      myNotification = new Notification({
        title,
        body,
        icon: getParentPath(__dirname, 2) + "/assets/icon.png",
        silent: false,
        timeoutType: "default",
        urgency: "normal",
      });
      myNotification.on("click", () => {
        this.screen.webContents.send("OPEN_URL", url);
        this.screen.show();
        this.screen.focus();
        myNotification.close();
      });
      myNotification.show();
    });
  }
}

module.exports = EventHandler