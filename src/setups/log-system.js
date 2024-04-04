const log = require("electron-log");

function setupLogSystem() {
  log.initialize();
}

module.exports = setupLogSystem;
