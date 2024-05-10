const {
  ipcMain,
  shell,
  systemPreferences,
  desktopCapturer,
  net,
} = require("electron");
const path = require('path')
const { APP_URL } = require("../../config");
const { EVENTS } = require("../../events");
const ScreenDoodle = require("../doodle");

function handleEvent(screen) {
  
  let doodleScreen = null;
  let currentURL = null;
  let isOnline = net.isOnline();
  

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
    if (doodleScreen) {
      doodleScreen.destroyAll();
      doodleScreen = null;
    }
  });

  // Event doodle
  ipcMain.on(EVENTS.SHARE_SCREEN_SUCCESS, (e, args) => {
    doodleScreen = new ScreenDoodle(args)
  });

  function changePage(internetStatus) {
    if (internetStatus === "offline") {
      currentURL = screen.webContents.getURL();
      screen.loadFile(path.join(__dirname, "error", "index.html"));
      if(doodleScreen) {
        doodleScreen.destroyAll();
        doodleScreen = null;
      }
    } else if (internetStatus === "online") {
      screen.loadURL(currentURL || APP_URL + "/talk");
    }
  }

  ipcMain.on(EVENTS.NETWORK_STATUS, (_, status) => {
    if (isOnline && status === "offline") {
      isOnline = false;
      changePage(status);
    } else if (!isOnline && status === "online") {
      isOnline = true;
      changePage(status);
    }
  });
  
}

module.exports = handleEvent;
