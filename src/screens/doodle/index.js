const { BrowserWindow } = require("electron");
const path = require('path')

const { EVENTS } = require("../../events");
const { IS_MAC } = require("../../config");
const handleEvent = require("./events-handler");

function createDooleScreen(args) {
  const screen = new BrowserWindow({
    transparent: true,
    frame: IS_MAC,
    alwaysOnTop: true,
    modal: true,
    show: false,
    roundedCorners: false,
    fullscreen: true,
    simpleFullscreen: true,
    // frame: true,
    // autoHideMenuBar: true,
    // skipTaskbar: true,
    hasShadow: false,
    webPreferences: {
      hardwareAcceleration: true,
      contextIsolation: true,
      nodeIntegration: true,
      preload: path.join(__dirname, "preload.js"),
    }
  });
  screen.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true, skipTransformProcessType: true});
  screen.setIgnoreMouseEvents(true, { forward: true })
  screen.loadFile(path.join(__dirname, "display", "index.html"))
  screen.setPosition(0, 0); 
  screen.maximize()
  screen.show()
  let level = 'normal';
  if (process.platform === 'darwin')level = 'floating';
  screen.setAlwaysOnTop(true, level);
  screen.webContents.on('did-finish-load', () => {
    screen.webContents.send(EVENTS.CALL_STATUS, args);
    screen.setFullScreen(true);
  });
  handleEvent(screen)
}

module.exports = createDooleScreen