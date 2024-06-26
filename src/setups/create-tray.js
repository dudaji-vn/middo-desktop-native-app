const { app, Tray, Menu, nativeImage } = require("electron");
const getParentPath = require("../utils/get-parent-path");
const { IS_MAC } = require("../config");
let tray;
function createTray(screen) {
  if (tray) {
    tray.destroy();
    tray = null;
  };
  const imageFileName = IS_MAC ? "trayTemplate.png" : "icon.ico";
  const icon = nativeImage.createFromPath(getParentPath(__dirname, 1) + "/assets/" + imageFileName);
  if (IS_MAC) icon.isMacTemplateImage = true;
  tray = new Tray(icon);
  tray.setIgnoreDoubleClickEvents(true);
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
  tray.setToolTip("Middo");
  tray.on("right-click", () => {
    tray.popUpContextMenu(contextMenu);
  });
  tray.on("click", () => {
    screen?.show();
    screen?.focus();
  });
}
module.exports = createTray;
