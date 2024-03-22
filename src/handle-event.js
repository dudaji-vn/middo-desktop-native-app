require('dotenv').config()
const {
  ipcMain,
  shell,
  systemPreferences,
  desktopCapturer,
  BrowserWindow,
  Notification,
} = require("electron");
const { EVENTS } = require("./events");
const { APP_URL } = require("./config");
const path = require("path");
const Store = require('electron-store');
const emitter = require('events');
emitter.setMaxListeners();

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
    const isMac = process.platform === 'darwin';
    canvasWindow = new BrowserWindow({
      transparent: true,
      frame: isMac,
      alwaysOnTop: true,
      modal: true,
      show: false,
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
    // canvasWindow.webContents.openDevTools({
    //   mode: 'detach'
    // })
    // canvasWindow.setParentWindow(mainWindow)
    // canvasWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })
    // canvasWindow.setAlwaysOnTop(true, '', 1);
    canvasWindow.setIgnoreMouseEvents(true, { forward: true })
    canvasWindow.loadFile(path.join(__dirname, "doodle", "canvas.html"))
    canvasWindow.setPosition(0, 0); 
    canvasWindow.maximize()
    canvasWindow.show()
    // canvasWindow.on('enter-full-screen', () => {
    //   canvasWindow.showHideMenuBar(false);
    // });

    // add onload event
    canvasWindow.webContents.on('did-finish-load', () => {
      canvasWindow.webContents.send(EVENTS.CALL_STATUS, args);
      canvasWindow.setFullScreen(true);
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

  //
  ipcMain.on('set-ignore-mouse-events', (event, ignore, options) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if(!win) return;
    win.setIgnoreMouseEvents(ignore, { forward: true })
  })

  // Event for drag able bar
  ipcMain.on(EVENTS.TOGGLE_MIC, () => {
    mainWindow.webContents.send(EVENTS.TOGGLE_MIC);
  });
  ipcMain.on(EVENTS.TOGGLE_CAMERA, () => {
    mainWindow.webContents.send(EVENTS.TOGGLE_CAMERA);
  });
  ipcMain.on(EVENTS.STOP_SHARE, () => {
    mainWindow.webContents.send(EVENTS.STOP_SHARE);
  });
  
  // Notification FCM Setup
  ipcMain.on(EVENTS.STORE_FCM_TOKEN, (e, token) => {
    store.set('fcm_token', token);
  });
  ipcMain.on("getFCMToken", async (e) => {
    e.sender.send('getFCMToken', store.get('fcm_token'));
  });
  ipcMain.on(EVENTS.SHOW_NOTIFICATION, (e, data) => {
    // Check is focused
    const isFocused = mainWindow.isFocused();
    let currentPathName = new URL(mainWindow.webContents.getURL())?.pathname;
    const {title, body, url} = data;
    let notifyPathName = new URL(url)?.pathname;
    if(currentPathName == notifyPathName && isFocused) return;
    const myNotification = new Notification({ 
      title, 
      body,
      sound: path.join(__dirname, 'assets', 'notification.mp3'),
      icon: path.join(__dirname, 'assets', 'icon.png'),
      silent: false
    });
    myNotification.on('click', () => {
        mainWindow.webContents.send('OPEN_URL', url);
        myNotification.close();
    });
    myNotification.show();
  });
  // End notification
}

module.exports = handleEvents;
