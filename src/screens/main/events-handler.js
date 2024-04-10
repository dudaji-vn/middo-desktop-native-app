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
const createDooleScreen = require("../doodle");
let myNotification;
let notifications = [];
let doodleScreen = null;
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

  screen.on("close", (event) => {
    event.preventDefault();
    screen.reload();
    screen.hide();
    if(doodleScreen) {
      doodleScreen?.hide();
      doodleScreen?.close();
      doodleScreen?.destroy();
      doodleScreen = null;
      ipcMain.removeAllListeners(EVENTS.CALL_STATUS);
      ipcMain.removeAllListeners(EVENTS.SEND_DOODLE_SHARE_SCREEN);
      ipcMain.removeAllListeners(EVENTS.SET_IGNORE_MOUSE_EVENT);
      ipcMain.removeAllListeners(EVENTS.STOP_SHARE_SCREEN);
    }
  });

  // Event doodle
  ipcMain.on(EVENTS.SHARE_SCREEN_SUCCESS, (e, args) => {
    doodleScreen = createDooleScreen(args)
  });

  // NOTIFICATION
  ipcMain.on(EVENTS.SHOW_NOTIFICATION, (e, data) => {
    let isShow = notifications.length === 0;
    notifications.push(data);
    if(isShow) {
      showNotification();
    }
  });

  function showNotification() {
    if(!notifications.length) return;
    const isFocused = screen.isFocused();
    const data = notifications[0];
    const { title, body, url } = data;
    
    // if (myNotification) {
    //   myNotification.close();
    //   myNotification.removeAllListeners();
    //   myNotification = null;
    // }
    
    let currentPathName = new URL(screen.webContents.getURL())?.pathname;
    let notifyPathName = new URL(url)?.pathname;
    log.info("Got notification::", {
      body: data.body, currentPathName, notifyPathName, isFocused
    });
    if (currentPathName == notifyPathName && isFocused) {
      notifications.shift();
      notifications = notifications.filter((item) => {
        return new URL(item.url)?.pathname !== currentPathName;
      });
      showNotification()
      return;
    };
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
      notifications.shift();
      showNotification();
    });
    myNotification.on("close", () => {
      notifications.shift();
      showNotification();
    });
  
    myNotification.show();
  }

  screen.webContents.on("did-navigate-in-page", (e, url) => {
    let pathName = new URL(url)?.pathname;
    notifications = notifications.filter((item) => {
      return new URL(item.url)?.pathname !== pathName;
    });
  });
}


module.exports = handleEvent;
