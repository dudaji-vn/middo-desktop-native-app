const {
  ipcMain,
  Notification,
  shell,
  screen,
  systemPreferences,
  desktopCapturer,
  BrowserWindow,
} = require("electron");
const { EVENTS } = require("./events");
const { APP_URL } = require("./config");
const path = require("path");
const Store = require('electron-store');

function handleEvents(mainWindow) {
  let canvasWindow;
  const store = new Store();
  ipcMain.on(EVENTS.GOOGLE_LOGIN, (event, args) => {
    shell.openExternal(APP_URL + "/login-google-electron");
  });

  ipcMain.on(EVENTS.GET_SCREEN_SOURCE, async (e) => {
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

  ipcMain.on(EVENTS.STOP_SHARE_SCREEN, () => {
    if(canvasWindow) {
      canvasWindow?.hide();
      canvasWindow?.close();
      canvasWindow?.destroy();
      canvasWindow = null;
    }
  });

  ipcMain.on(EVENTS.SHARE_SCREEN_SUCCESS, (e, args) => {
    canvasWindow = new BrowserWindow({
      transparent: true,
      frame: true,
      alwaysOnTop: true,
      modal: true,
      show: false,
      fullscreenable: true,
      roundedCorners: false,
      fullscreen: true,
      simpleFullscreen: true,
      webPreferences: {
        hardwareAcceleration: true,
        contextIsolation: true,
        nodeIntegration: true,
        preload: path.join(__dirname, "preload.js"),
      }
    });
    // Show dev tool
    // canvasWindow.webContents.openDevTools()
    // canvasWindow.setParentWindow(mainWindow)
    // canvasWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })
    canvasWindow.setIgnoreMouseEvents(true, { forward: true })
    canvasWindow.loadFile(path.join(__dirname, "doodle", "canvas.html"))
    canvasWindow.setPosition(0, 0); 
    canvasWindow.maximize()
    canvasWindow.show()
    canvasWindow.on('enter-full-screen', () => {
      screen.showHideMenuBar(false);
    });

    // add onload event
    canvasWindow.webContents.on('did-finish-load', () => {
      canvasWindow.webContents.send(EVENTS.CALL_STATUS, args);
    });
  });

  ipcMain.on(EVENTS.CALL_STATUS, (e, args) => {
    if(canvasWindow) {
      canvasWindow.webContents.send(EVENTS.CALL_STATUS, args);
    }
  });

  ipcMain.on(EVENTS.SEND_DOODLE_SHARE_SCREEN, (e, args) => {
    if(canvasWindow) {
      canvasWindow.webContents.send(EVENTS.SEND_DOODLE_SHARE_SCREEN, args);
    }
  })

  ipcMain.on(EVENTS.STORE_FCM_TOKEN, (e, token) => {
    store.set('fcm_token', token);
  });
  
  ipcMain.on("getFCMToken", async (e) => {
    e.sender.send('getFCMToken', store.get('fcm_token'));
  });
  
  ipcMain.on(EVENTS.SHOW_NOTIFICATION, (e, data) => {
    const {title, body, url} = data;
    const myNotification = new Notification({ title, body });
    myNotification.onclick = () => {
      console.log('Notification clicked::', url);
      myNotification.close();
    }
    myNotification.show();
  });

}

module.exports = handleEvents;
