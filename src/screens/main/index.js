const { app, BrowserWindow } = require("electron");
const path = require('path')
const { APP_TITLE, IS_MAC } = require("../../config");
const EventHandler = require( "./events-handler");
class MainScreen {
  constructor(loadUrl) {
    this.instance = new BrowserWindow({
      title: APP_TITLE,
      icon: "../../assets/icon.ico",
      webPreferences: {
        contextIsolation: true,
        nodeIntegration: true,
        preload: path.join(__dirname, "preload.js"),
      },
    });
    this.instance.setMenu(null);
    this.instance.maximize();
    this.instance.loadURL(loadUrl);
    this.instance.on("close", (event) => {
      event.preventDefault();
      this.hide();
    });
    this.instance.on("focus", () => {
      this.handleFocus();
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

  handleFocus() {
    if(IS_MAC) {
      app?.dock?.setBadge("");
    } else {
      this.instance.setOverlayIcon(null, '')
    }
  }

}

module.exports = MainScreen