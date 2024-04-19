const { updateElectronApp } = require("update-electron-app");
const log = require("electron-log");
const { IS_MAC } = require("../config");

function setupAutoUpdate() {
  updateElectronApp({
    logger: {
      info: (msg) => {
        log.info(msg);
      },
      error: (msg) => {
        log.error(msg);
      },
      warn: (msg) => {
        log.warn(msg);
      },
      log: (msg) => {
        log.log(msg);
      },
    },
    notifyUser: !IS_MAC,
  });
}
module.exports = setupAutoUpdate;
