const log = require("electron-log");
class LogSystem {
  constructor() {}

  setup() {
    log.initialize();
    log.transports.file.resolvePathFn = () => __dirname + "/log.log";
  }
}

module.exports = LogSystem;
