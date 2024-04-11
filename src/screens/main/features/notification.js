const { app, ipcMain, Notification } = require('electron');
const log = require('electron-log');
const getParentPath = require('../../../utils/get-parent-path');
const { EVENTS } = require('../../../events');
const { IS_MAC } = require('../../../config');
let notifications = [];
let myNotification = null;
function handleNotification(screen) {
  function showNotification() {
    if (!notifications.length) return;
    const isFocused = screen.isFocused();
    const data = notifications[0];
    const { title, body, url } = data;
    if (myNotification) {
      myNotification.close();
      myNotification.removeAllListeners();
      myNotification = null;
    }

    let currentPathName = new URL(screen.webContents.getURL())?.pathname;
    let notifyPathName = new URL(url)?.pathname;
    log.info("Got notification::", {
      body: data.body,
      currentPathName,
      notifyPathName,
      isFocused,
    });
    if (currentPathName == notifyPathName && isFocused) {
      notifications.shift();
      notifications = notifications.filter((item) => {
        return new URL(item.url)?.pathname !== currentPathName;
      });
      showNotification();
      return;
    }
    if (!isFocused) {
      if (IS_MAC) {
        app?.dock?.bounce();
        app?.dock?.setBadge("•");
      } else {
        screen.setOverlayIcon(
          nativeImage.createFromPath(
            getParentPath(__dirname, 2) + "/assets/badge.png"
          ),
          "New notification"
        );
      }
    }
    myNotification = new Notification({
      title,
      body,
      icon: getParentPath(__dirname, 3) + "/assets/icon.png",
      // silent: false,
      // timeoutType: "default",
      // urgency: "normal",
    });
    myNotification.on("click", () => {
      screen.webContents.send("OPEN_URL", url);
      screen.show();
      screen.focus();
      myNotification.close();
      notifications.shift();
      showNotification();
    });
    myNotification.on("close", () => {
    log.info('close event')
      notifications.shift();
      showNotification();
    });

    myNotification.show();
  }

  ipcMain.on(EVENTS.SHOW_NOTIFICATION, (e, data) => {
    let isShow = notifications.length === 0;
    notifications.push(data);
    if (isShow) {
      showNotification();
    }
  });

  screen.webContents.on("did-navigate-in-page", (e, url) => {
    let pathName = new URL(url)?.pathname;
    notifications = notifications.filter((item) => {
      return new URL(item.url)?.pathname !== pathName;
    });
  });
}


module.exports = handleNotification