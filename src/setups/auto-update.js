const { updateElectronApp } = require("update-electron-app");
const log = require("electron-log");
const { IS_MAC } = require("../config");

function setupAutoUpdate() {
  updateElectronApp({
    logger: {
      info: (msg) => {
        log.info("Auto update INFO::", msg);
      },
      error: (msg) => {
        log.error("Auto update ERROR::", msg);
      },
      warn: (msg) => {
        log.warn("Auto update WARN::", msg);
      },
      log: (msg) => {
        log.info("Auto update LOG::", msg);
      },
    },
  });
}
module.exports = setupAutoUpdate;
