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
  function openUrl(urlStr) {
    try {
      if (!urlStr) return;
      log.info("open-url", urlStr);
      const urlParse = url.parse(urlStr, true);
      let dataEncode = urlParse.query?.data;
      if(!dataEncode) return;
      // remove %7 from end of dataEncode if have by } character
      if(dataEncode.endsWith("%7")) {
        dataEncode = dataEncode.slice(0, -2);
        dataEncode += "}";
      }
      const dataString = decodeURIComponent(dataEncode);
      if(!dataString) return;
      const data = JSON.parse(dataString);
      if(!data || !data?.type || !data.data) return;
      if(mainWindow) {
        mainWindow.setAlwaysOnTop(true);
        mainWindow.show();
        mainWindow.setAlwaysOnTop(false);
        app.focus();
      }
      switch(data.type) {
        case "google-login":
          const { token, refresh_token } = data.data;
          if(!token || !refresh_token) return;
          log.info("login google", { token, refresh_token });
          mainWindow.webContents.send(EVENTS.GOOGLE_LOGIN_SUCCESS, {
            token,
            refresh_token,
          });
          break;
        case 'redirect': // This for click custom link in notification
          const { url } = data.data;
          if(!url) return;
          log.info("open inside url", url);
          mainWindow.webContents.send("OPEN_URL", url);
          break;
        default:
          break;
      }
    } catch (error) {
      log.error(error);
    }
  }
  
  function appReady() {
    mainWindow = createMainScreen(APP_URL + '/talk');
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