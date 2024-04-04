// File setup for window start up app => It mean When click window key and search it will be show own app
const { app } = require("electron");
const { IS_MAC } = require("../config");

function setupStartUpApp() {
  if (!IS_MAC) {
    if (require("electron-squirrel-startup")) app.quit();
  }
}

module.exports = setupStartUpApp