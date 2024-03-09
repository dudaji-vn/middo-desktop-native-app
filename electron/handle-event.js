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

function handleEvents(mainWindow) {
  let canvasWindow;
  ipcMain.on("send-message", (event, args) => {
    console.log(args);
    event.reply("reply-message", "Hello from main process");
  });

  ipcMain.on("notify", (event, args) => {
    new Notification({ title: "Notification", body: "Hiii" }).show();
  });

  ipcMain.on(EVENTS.GOOGLE_LOGIN, (event, args) => {
    shell.openExternal(APP_URL + "/sign-in?type=desktop");
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
    canvasWindow.hide();
  });

  ipcMain.on(EVENTS.SHARE_SCREEN_SUCCESS, () => {
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
    canvasWindow.loadFile('canvas.html')
    canvasWindow.setPosition(0, 0); 
    canvasWindow.maximize()
    canvasWindow.show()
    canvasWindow.on('enter-full-screen', () => {
      screen.showHideMenuBar(false);
    });

  });

  ipcMain.on(EVENTS.SEND_DOODLE_SHARE_SCREEN, (e, args) => {
    canvasWindow.webContents.send(EVENTS.SEND_DOODLE_SHARE_SCREEN, args);
  })
}

module.exports = handleEvents;
