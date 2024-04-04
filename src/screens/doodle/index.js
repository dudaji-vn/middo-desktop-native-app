const { BrowserWindow } = require("electron");
const path = require('path')
const { EVENTS } = require("../../events");
const EventHandler = require("./events-handler");
const { IS_MAC } = require("../../config");
class DoodleScreen {
  constructor(args) { // args is call status
    this.instance = new BrowserWindow({
      transparent: true,
      frame: IS_MAC,
      alwaysOnTop: true,
      modal: true,
      show: false,
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
    // this.instance.webContents.openDevTools({
    //   mode: 'detach'
    // });
    this.instance.setIgnoreMouseEvents(true, { forward: true })
    this.instance.loadFile(path.join(__dirname, "display", "index.html"))
    this.instance.setPosition(0, 0); 
    this.instance.maximize()
    this.instance.show()
    this.instance.webContents.on('did-finish-load', () => {
      this.instance.webContents.send(EVENTS.CALL_STATUS, args);
      this.instance.setFullScreen(true);
    });

    this.eventHandler = new EventHandler(this.instance)
  }

  show() {
    this.instance?.show();
  }

  hide() {
    this.instance?.hide();
  }

  focus() {
    this.instance?.focus();
  }

  destroy() {
    this.eventHandler.destroyAllListener()
    this.instance?.hide();
    this.instance?.close();
    this.instance?.destroy();
    this.instance = null;
  }

}

module.exports = DoodleScreen