const { BrowserWindow } = require("electron");
const path = require('path')
const { APP_TITLE } = require("../../config");
class ErrorScreen {
  constructor() {
    this.instance = new BrowserWindow({
      title: APP_TITLE,
      icon: "../../assets/icon.ico",
    });
    this.instance.loadFile(path.join(__dirname, "display", "index.html"))
    
  }
}

module.exports = ErrorScreen