const { app } = require("electron");
const path = require("path");
const { DEEP_LINK } = require("../config");
function setupDeepLink() {
  if (process.defaultApp) {
    if (process.argv.length >= 2) {
      app.setAsDefaultProtocolClient(DEEP_LINK, process.execPath, [
        path.resolve(process.argv[1]),
      ]);
    }
  } else {
    app.setAsDefaultProtocolClient(DEEP_LINK);
  }
}
module.exports = setupDeepLink;
