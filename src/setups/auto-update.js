const { updateElectronApp } = require("update-electron-app");
const log = require("electron-log");

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
  });
}
module.exports = setupAutoUpdate;
