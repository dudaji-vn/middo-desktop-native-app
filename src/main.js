require('dotenv').config()
const { app, BrowserWindow } = require("electron");
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
  mainWindow = new BrowserWindow({
    title: "Middo",
    // backgroundColor: '#2e2c29',
    icon: path.join(__dirname, "src", "assets", "icon.ico"),
    // alwaysOnTop: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });
  // Hide menu bar
  mainWindow.setMenu(null);
  mainWindow.maximize();
  mainWindow.loadURL(APP_URL);
  // mainWindow.webContents.openDevTools();
  setupPushReceiver(mainWindow.webContents);
  handleEvents(mainWindow);
}


app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})
