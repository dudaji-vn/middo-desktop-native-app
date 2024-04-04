const { EVENTS } = require("../../events");

const { ipcMain, BrowserWindow } = require("electron");

class EventHandler {
  constructor(screen) {
    this.screen = screen;
    this.listenEvent();
  }

  destroyAllListener() {
    ipcMain.removeAllListeners(EVENTS.CALL_STATUS);
    ipcMain.removeAllListeners(EVENTS.SEND_DOODLE_SHARE_SCREEN);
    ipcMain.removeAllListeners(EVENTS.SET_IGNORE_MOUSE_EVENT);
    ipcMain.removeAllListeners(EVENTS.CALL_STATUS);
  }

  listenEvent() {

    ipcMain.on(EVENTS.CALL_STATUS, (e, args) => {
      if (this.screen) {
        this.screen.webContents.send(EVENTS.CALL_STATUS, args);
      }
    });

    ipcMain.on(EVENTS.SEND_DOODLE_SHARE_SCREEN, (e, args) => {
      if (this.screen) {
        this.screen.webContents.send(EVENTS.SEND_DOODLE_SHARE_SCREEN, args);
      }
    });

    // Ignore mose event to create transparent screen
    ipcMain.on(EVENTS.SET_IGNORE_MOUSE_EVENT, (event, ignore, _) => {
      const win = BrowserWindow.fromWebContents(event.sender);
      if (!win) return;
      win.setIgnoreMouseEvents(ignore, { forward: true });
    });
  }
}


module.exports = EventHandler