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


app.on("second-instance", (event, commandLine, workingDirectory) => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
  loginCallback(commandLine.pop().slice(0, -1));
});

// Create mainWindow, load the rest of the app, etc...
app.whenReady().then(() => {
  createTray();
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
  mainWindow.on("close", (event) => {
    event.preventDefault();
    // mainWindow.hide();
    if(mainWindow.isMinimized()) mainWindow.restore();
    else mainWindow.minimize();
  });

  mainWindow.on("show", () => {
    app.dock.show();
    mainWindow.setSkipTaskbar(false);
  });

  mainWindow.on("hide", () => {
    app.dock.hide();
    mainWindow.setSkipTaskbar(true);
  });
  // mainWindow.webContents.openDevTools();
  setupPushReceiver(mainWindow.webContents);
  handleEvents(mainWindow);
}

function createTray() {
  const icon = nativeImage.createFromPath(path.join(__dirname, "assets", "tray.png"))
  tray = new Tray(icon)
  const contextMenu = Menu.buildFromTemplate([
    { label: "Open Middo", type: "normal", click: () => mainWindow.show() },
    { label: "Quit", type: "normal", click: () => {
      app.quit();
    } },
  ])
  tray.setToolTip('Middo')
  tray.setContextMenu(contextMenu)
  // tray.addListener("click", () => createWindow());
}
app.on("ready", createWindow);
app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
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