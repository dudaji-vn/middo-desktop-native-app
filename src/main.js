const {
  app,
  BrowserWindow,
  ipcMain,
  Notification,
  shell,
  systemPreferences,
  screen,
} = require("electron");
require('dotenv').config()
const path = require("path");
const { setup: setupPushReceiver } = require("electron-push-receiver");
const url = require('url');
const handleEvents = require("./handle-event");
const { EVENTS } = require("./events");
const { APP_URL } = require("./config");
let mainWindow;

// Set deep links
if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient("middo", process.execPath, [
      path.resolve(process.argv[1]),
    ]);
  }
} else {
  app.setAsDefaultProtocolClient("middo");
}

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on("second-instance", (event, commandLine, workingDirectory) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
    loginCallback(commandLine.pop().slice(0, -1));
  });

  // Create mainWindow, load the rest of the app, etc...
  app.whenReady().then(() => {
    createWindow();
    app.setAppUserModelId("middo")
    checkPermission();
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
      }
    })
  });

  app.on("open-url", (event, url) => {
    loginCallback(url);
  });
}

function loginCallback(urlStr) {
  const query = url.parse(urlStr, true).query;
  const { token, refresh_token } = query;
  mainWindow.webContents.send(EVENTS.GOOGLE_LOGIN_SUCCESS, { token, refresh_token });
}

function createWindow() {
  const screenSize = screen.getPrimaryDisplay().workAreaSize;
  mainWindow = new BrowserWindow({
    title: "Middo",
    // backgroundColor: '#2e2c29',
    icon: path.join(__dirname, "src", "assets", "icon.ico"),
    width: screenSize.width,
    height: screenSize.height,
    // alwaysOnTop: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });
  // Hide menu bar
  // mainWindow.setMenu(null);
  mainWindow.loadURL(APP_URL);
  // mainWindow.webContents.openDevTools();
  setupPushReceiver(mainWindow.webContents);
  // checkPermission();
}

handleEvents(mainWindow);
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

ipcMain.on('set-ignore-mouse-events', (event, ignore, options) => {
  const win = BrowserWindow.fromWebContents(event.sender)
  win.setIgnoreMouseEvents(ignore, options)
})

ipcMain.on(EVENTS.TOGGLE_MIC, () => {
  mainWindow.webContents.send(EVENTS.TOGGLE_MIC);
});
ipcMain.on(EVENTS.TOGGLE_CAMERA, () => {
  mainWindow.webContents.send(EVENTS.TOGGLE_CAMERA);
});
ipcMain.on(EVENTS.STOP_SHARE, () => {
  mainWindow.webContents.send(EVENTS.STOP_SHARE);
});

// Check and get permission for access mic and camera
const checkPermission = async () => {
  // const micPermission = await systemPreferences.askForMediaAccess("microphone");
  // const cameraPermission = await systemPreferences.askForMediaAccess("camera");
  // if(!micPermission) {
  //   shell.openExternal(
  //     "x-apple.systempreferences:com.apple.preference.security?Privacy_Microphone"
  //   );
  // } else if(!cameraPermission) {
  //   shell.openExternal(
  //     "x-apple.systempreferences:com.apple.preference.security?Privacy_Camera"
  //   );
  // }
}


ipcMain.on(EVENTS.SHOW_NOTIFICATION, (e, data) => {
  // Check is focused
  const isFocused = mainWindow.isFocused();
  if(isFocused) return;
  const {title, body, url} = data;
  const myNotification = new Notification({ 
    title, 
    body,
    sound: path.join(__dirname, 'assets', 'notification.mp3'),
    icon: path.join(__dirname, 'assets', 'icon.png'),
    silent: false
  });
  myNotification.onclick = () => {
    console.log('Notification clicked::', url);
    myNotification.close();
  }
  myNotification.show();
});