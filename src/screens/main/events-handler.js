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
const CallComingScreen = require("../call-coming");

function handleEvent(screen) {
  
  let doodleScreen = null;
  let callComingScreen = null;
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
    if (callComingScreen) {
      callComingScreen.destroy();
      callComingScreen = null;
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
      if(callComingScreen) {
        callComingScreen.destroy();
        callComingScreen = null;
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

  ipcMain.on(EVENTS.REFRESH, () => {
    screen.reload();
  });

  // Event receive call from main
  ipcMain.on(EVENTS.RECEIVE_CALL_INVITE, (_, args) => {
    callComingScreen = new CallComingScreen(args);
    ipcMain.on(EVENTS.NO_CALL, (_) => {
      if(callComingScreen) {
        callComingScreen.destroy();
        callComingScreen = null;
      }
      ipcMain.removeAllListeners(EVENTS.NO_CALL);
      ipcMain.removeAllListeners(EVENTS.CALL_RESPONSE);
    });
    ipcMain.on(EVENTS.CALL_RESPONSE, (_, response) => {
      if(callComingScreen) {
        callComingScreen.destroy();
        callComingScreen = null;
      }
      if(response == 'ACCEPT') {
        // Focus to main screen
        if(screen.isMinimized()) {
          screen.restore();
        }
        screen.setAlwaysOnTop(true);
        screen.focus();
        screen.show();
        screen.setAlwaysOnTop(false);
      }
      
      // Send response to main
      screen.webContents.send(EVENTS.CALL_RESPONSE, response);

      // Remove event listener
      ipcMain.removeAllListeners(EVENTS.NO_CALL);
      ipcMain.removeAllListeners(EVENTS.CALL_RESPONSE);

    });
  });

  
  
  
  
}

module.exports = handleEvent;
