const { app, Tray, Menu, nativeImage } = require("electron");
const getParentPath = require("../utils/get-parent-path");
const { IS_MAC } = require("../config");

class TrayIcon {
  constructor(screen) {
    const imageFileName = IS_MAC ? "trayTemplate.png" : "icon.ico";
    const icon = nativeImage.createFromPath(getParentPath(__dirname, 1) + "/assets/" + imageFileName);
    if (IS_MAC) icon.isMacTemplateImage = true;
    this.tray = new Tray(icon);
    const contextMenu = Menu.buildFromTemplate([
      { label: "Open Middo", type: "normal", click: () => screen?.show() },
      {
        label: "Quit",
        type: "normal",
        click: () => {
          app.quit();
        },
      },
    ]);
    this.tray.setToolTip("Middo");
    this.tray.on("right-click", () => {
      this.tray.popUpContextMenu(contextMenu);
    });
    this.tray.on("click", () => {
      screen?.show();
      screen?.focus();
    });
  }

}

module.exports = TrayIcon;
