require('dotenv').config()
const { app, BrowserWindow, Tray, nativeImage, Menu } = require("electron");
const path = require("path");
const { setup: setupPushReceiver } = require("electron-push-receiver");
const url = require('url');
const checkInternetConnected = require('check-internet-connected');
const handleEvents = require("./handle-event");
const { EVENTS } = require("./events");
const { APP_URL } = require("./config");

let mainWindow;
let tray
const IS_MAC = process.platform === 'darwin';

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

// Set single instance
app.on("second-instance", (event, commandLine, workingDirectory) => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
  loginCallback(commandLine.pop().slice(0, -1));
});

app.on("open-url", (event, url) => {
  loginCallback(url);
});

function loginCallback(urlStr) {
  const query = url.parse(urlStr, true).query;
  const { token, refresh_token } = query;
  mainWindow.webContents.send(EVENTS.GOOGLE_LOGIN_SUCCESS, { token, refresh_token });
}

async function createWindow() {
  // Check have internet connection
  const isOnline = await checkInternetConnected();
  if(!isOnline) {
    const errorWindow = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        contextIsolation: true,
        nodeIntegration: true,
        preload: path.join(__dirname, "preload.js"),
      },
    });
    errorWindow.loadFile(path.join(__dirname, "error.html"));
    return;
  }

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

  // Handle prevent close to run in background
  mainWindow.on("close", (event) => {
    event.preventDefault();
    mainWindow.hide();
    return false
  });
  setupPushReceiver(mainWindow.webContents);
  handleEvents(mainWindow);
}

function createTray() {
  if(tray) return;
  const imageFileName = IS_MAC ? 'trayTemplate.png' : "icon.ico";
  const icon = nativeImage.createFromPath(path.join(__dirname, "assets", imageFileName));
  if(IS_MAC) {
    icon.isMacTemplateImage = true;
  }
  tray = new Tray(icon)
  const contextMenu = Menu.buildFromTemplate([
    { label: "Open Middo", type: "normal", click: () => mainWindow.show() },
    { label: "Quit", type: "normal", click: () => {
      app.quit();
    } },
  ])
  tray.setToolTip('Middo')
  tray.setContextMenu(contextMenu)
}
app.on("ready", ()=>{
  createTray();
  createWindow();
});
app.on("activate", () => {
  if(mainWindow) {
    mainWindow.show();
    return;
  }
  if (BrowserWindow.getAllWindows().length === 0) {
    createTray();
    createWindow();
  }
});

function handleQuit() {
  if (process.platform !== "darwin") {
    app.quit();
  }
}

app.on('window-all-closed', function () {
  handleQuit();
})

app.on("before-quit", (event) => {
  const windows = BrowserWindow.getAllWindows();
  windows.forEach((window) => window.destroy());
});