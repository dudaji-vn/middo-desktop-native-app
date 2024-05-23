const { BrowserWindow, ipcMain } = require("electron");
const path = require('path')

const { EVENTS } = require("../../events");
const { IS_MAC } = require("../../config");

class CallComingScreen {
  constructor(args) {
    this.screen = new BrowserWindow({
      alwaysOnTop: true,
      modal: true,
      show: false,
      roundedCorners: false,
      hasShadow: true,
      width: 320,
      height: IS_MAC ? 200 : 220,
      webPreferences: {
        hardwareAcceleration: true,
        contextIsolation: true,
        nodeIntegration: true,
        preload: path.join(__dirname, "preload.js"),
      }
    });
    this.screen.loadFile(path.join(__dirname, "display", "index.html"))
    this.screen.show()
    // Hide scrollbars
    this.screen.webContents.on('did-finish-load', () => {
      this.screen.webContents.insertCSS('::-webkit-scrollbar { display: none; }');
    });
    // Hide menu
    this.screen.setMenu(null);
    let level = 'normal';
    if (process.platform === 'darwin')level = 'floating';
    this.screen.setAlwaysOnTop(true, level);
    this.screen.webContents.on('did-finish-load', () => {
      this.screen.webContents.send(EVENTS.INCOMING_CALL_DATA, args);
    });
  }

  destroy() {
    this.screen.hide();
    this.screen.close();
    this.screen.destroy();
    this.screen = null;
  }
}

module.exports = CallComingScreen