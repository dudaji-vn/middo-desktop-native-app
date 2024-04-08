const { setup: setupPushReceiver } = require("electron-push-receiver");
const { app, BrowserWindow, net, ipcMain } = require("electron");
const log = require("electron-log");
const path = require("path");
const url = require("url");

const setupAutoUpdate = require("./setups/auto-update");
const setupLogSystem = require("./setups/log-system");
const setupStartUpApp = require("./setups/start-up");
const setupDeepLink = require("./setups/deep-link");
const setupShortcut = require("./setups/shortcut");
const createTray = require("./setups/create-tray");
const createMainScreen = require("./screens/main");
const globalEvents = require("./global-events");

const { APP_URL, IS_MAC, APP_MODEL_ID } = require("./config");
const { EVENTS } = require("./events");

app.setAppUserModelId(APP_MODEL_ID);
setupLogSystem();
setupAutoUpdate();
setupStartUpApp();
setupDeepLink();
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  let mainWindow;
  let currentURL = null;
  function openUrl(urlStr) {
    log.info("open-url", urlStr);
    if (!urlStr) return;
    const urlParse = url.parse(urlStr, true);
    const {query, pathname, host} = urlParse;
    if(pathname && pathname !== "/") {
      if (!mainWindow) {
        app.on("ready", () => {
          openUrl(urlStr);
        });
        return;
      }
      log.info("open inside url", host + pathname);
      mainWindow.webContents.send("OPEN_URL", host + pathname);
      mainWindow.show();
      mainWindow.focus();
      return;
    }
    const { token, refresh_token } = query;
    log.info("login google", { token, refresh_token });
    mainWindow.webContents.send(EVENTS.GOOGLE_LOGIN_SUCCESS, {
      token,
      refresh_token,
    });
  }
  
  function changePage(internetStatus) {
    if (internetStatus === "offline") {
      currentURL = mainWindow.webContents.getURL()
      mainWindow.loadFile(path.join(__dirname, "screens", "main", "error", "index.html"))
    } else if(internetStatus === "online") {
      mainWindow.loadURL(currentURL || APP_URL)
    }
  }

  function appReady() {
    let isOnline = net.isOnline();
    mainWindow = createMainScreen(APP_URL, isOnline)
    ipcMain.on(EVENTS.NETWORK_STATUS, (_, status) => {
      if (isOnline && status === "offline") {
        isOnline = false
        changePage(status)
      } else if(!isOnline && status === "online") {
        isOnline = true
        changePage(status)
      }
    });
    createTray(mainWindow);
    setupPushReceiver(mainWindow.webContents);
    setupShortcut(mainWindow);
    globalEvents();
    // mainWindow.webContents.openDevTools();
  }
  
  app.on("browser-window-focus", () => {
    log.info("browser-window-focus");
    mainWindow.webContents.send(EVENTS.WINDOW_FOCUSED, {});
  });
  app.on("ready", () => appReady());
  app.on("activate", () => {
    if (mainWindow) {
      mainWindow.show();
      return;
    }
    if (BrowserWindow.getAllWindows().length === 0) {
      appReady();
    }
  });
  app.on("window-all-closed", function () {
    if (!IS_MAC) app.quit();
  });
  app.on("before-quit", () => {
    const windows = BrowserWindow.getAllWindows();
    windows.forEach((window) => window.destroy());
  });
  app.on("second-instance", (_, commandLine, __) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    }
    openUrl(commandLine.pop().slice(0, -1));
  });
  app.on("open-url", (event, url) => {
    log.info("open-url", url);
    openUrl(url);
  });
}

process.on("uncaughtException", (error) => {
  log.error(error);
  app.quit();
});