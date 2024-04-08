const { app, BrowserWindow } = require("electron");
const path = require("path");

const handleEvent = require("./events-handler");
const { APP_TITLE, IS_MAC } = require("../../config");

function createMainScreen(loadUrl, isOnline = false) {
  let screen = new BrowserWindow({
    title: APP_TITLE,
    icon: "../../assets/icon.ico",
    minWidth: 400,
    minHeight: 500,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });
  screen.setMenu(null);
  screen.maximize();

  if(isOnline) {
    screen.loadURL(loadUrl);
  } else {
    screen.loadFile(path.join(__dirname, "error", "index.html"));
  }

  screen.on("close", (event) => {
    event.preventDefault();
    screen.hide();
  });
  screen.on("focus", () => {
    if (IS_MAC) {
      app?.dock?.setBadge("");
    } else {
      screen.setOverlayIcon(null, "");
    }
  });
  handleEvent(screen)

  return screen;
}
module.exports = createMainScreen;
