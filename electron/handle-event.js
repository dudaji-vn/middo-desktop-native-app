const {
  ipcMain,
  Notification,
  shell,
  systemPreferences,
  desktopCapturer,
} = require("electron");
const { EVENTS } = require("./events");
const { APP_URL } = require("./config");

function handleEvents() {
  ipcMain.on("send-message", (event, args) => {
    console.log(args);
    event.reply("reply-message", "Hello from main process");
  });

  ipcMain.on("notify", (event, args) => {
    new Notification({ title: "Notification", body: "Hiii" }).show();
  });

  ipcMain.on(EVENTS.GOOGLE_LOGIN, (event, args) => {
    shell.openExternal(APP_URL + "/sign-in?type=desktop");
  });

  ipcMain.on(EVENTS.GET_SCREEN_SOURCE, async (e) => {
    if (systemPreferences.getMediaAccessStatus) {
      const permissionStatus = systemPreferences.getMediaAccessStatus("screen");
      if (permissionStatus !== "granted") {
        shell.openExternal(
          "x-apple.systempreferences:com.apple.preference.security?Privacy_ScreenCapture"
        );
      }
    }
    const sources = await desktopCapturer.getSources({
      types: ["window", "screen"],
      thumbnailSize: {
        width: 1280,
        height: 720,
      },
    });
    sources.forEach((source) => {
      source.thumbnail = source.thumbnail.toDataURL();
    });
    e.sender.send(EVENTS.GET_SCREEN_SOURCE, sources);
  });
}

module.exports = handleEvents;
