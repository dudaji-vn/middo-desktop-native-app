const { BrowserWindow, ipcMain } = require("electron");
const path = require('path')

const { EVENTS } = require("../../events");
const { IS_MAC } = require("../../config");

class ScreenDoodle {
  constructor(args) {
    this.screen = new BrowserWindow({
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
    this.screen.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true, skipTransformProcessType: true});
    this.screen.setIgnoreMouseEvents(true, { forward: true })
    this.screen.loadFile(path.join(__dirname, "display", "index.html"))
    this.screen.setPosition(0, 0); 
    this.screen.maximize()
    this.screen.show()
    let level = 'normal';
    if (process.platform === 'darwin')level = 'floating';
    this.screen.setAlwaysOnTop(true, level);
    this.screen.webContents.on('did-finish-load', () => {
      this.screen.webContents.send(EVENTS.CALL_STATUS, args);
      this.screen.setFullScreen(true);
    });
    this.handleEvent()
  }

  destroyAll() {
    this.screen?.hide();
    this.screen?.close();
    this.screen?.destroy();
    this.screen = null;
    ipcMain.removeAllListeners(EVENTS.CALL_STATUS);
    ipcMain.removeAllListeners(EVENTS.SEND_DOODLE_SHARE_SCREEN);
    ipcMain.removeAllListeners(EVENTS.SET_IGNORE_MOUSE_EVENT);
    ipcMain.removeAllListeners(EVENTS.STOP_SHARE_SCREEN);
  }

  handleEvent() {
    ipcMain.on(EVENTS.CALL_STATUS, (e, args) => {
      if (this.screen) this.screen.webContents.send(EVENTS.CALL_STATUS, args);
    });
  
    ipcMain.on(EVENTS.SEND_DOODLE_SHARE_SCREEN, (e, args) => {
      if (this.screen) this.screen.webContents.send(EVENTS.SEND_DOODLE_SHARE_SCREEN, args);
    });
    
    ipcMain.on(EVENTS.STOP_SHARE_SCREEN, () => {
      this.destroyAll()
    });
  
    // Ignore mose event to create transparent screen
    ipcMain.on(EVENTS.SET_IGNORE_MOUSE_EVENT, (event, ignore, _) => {
      const win = BrowserWindow.fromWebContents(event.sender);
      if (!win) return;
      win.setIgnoreMouseEvents(ignore, { forward: true });
    });
  }
}

module.exports = ScreenDoodle