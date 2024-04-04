const { app, BrowserWindow } = require("electron");
const { setup: setupPushReceiver } = require("electron-push-receiver");
const url = require("url");
const log = require("electron-log");

const { EVENTS } = require("./events");
const { APP_URL, IS_MAC, APP_MODEL_ID } = require("./config");

const globalEvents = require("./global-events");
const setupLogSystem = require("./setups/log-system");
const setupAutoUpdate = require("./setups/auto-update");
const setupStartUpApp = require("./setups/start-up");
const setupDeepLink = require("./setups/deep-link");
const MainScreen = require("./screens/main");
const createTray = require("./setups/create-tray");

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
    const query = url.parse(urlStr, true).query;
    const { token, refresh_token } = query;
    mainWindow.webContents.send(EVENTS.GOOGLE_LOGIN_SUCCESS, {
      token,
      refresh_token,
    });
  }
  function appReady() {
    log.info('App is ready');
    mainWindow = new MainScreen(APP_URL).instance
    createTray(mainWindow);
    setupPushReceiver(mainWindow.webContents);
    globalEvents();
    
  }

  app.on("ready", () => {
    appReady();
  });
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
    log.info("window-all-closed");
    if (!IS_MAC) app.quit();
  });
  app.on("before-quit", () => {
    log.info("before-quit");
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