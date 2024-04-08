const { EVENTS } = require("../../events");

const { ipcMain, BrowserWindow } = require("electron");
function handleEvent(screen) {
  ipcMain.on(EVENTS.CALL_STATUS, (e, args) => {
    if (screen) screen.webContents.send(EVENTS.CALL_STATUS, args);
  });

  ipcMain.on(EVENTS.SEND_DOODLE_SHARE_SCREEN, (e, args) => {
    if (screen) screen.webContents.send(EVENTS.SEND_DOODLE_SHARE_SCREEN, args);
  });
  
  ipcMain.on(EVENTS.STOP_SHARE_SCREEN, () => {
    screen?.hide();
    screen?.close();
    screen?.destroy();
    screen = null;
    ipcMain.removeAllListeners(EVENTS.CALL_STATUS);
    ipcMain.removeAllListeners(EVENTS.SEND_DOODLE_SHARE_SCREEN);
    ipcMain.removeAllListeners(EVENTS.SET_IGNORE_MOUSE_EVENT);
    ipcMain.removeAllListeners(EVENTS.STOP_SHARE_SCREEN);
  });

  // Ignore mose event to create transparent screen
  ipcMain.on(EVENTS.SET_IGNORE_MOUSE_EVENT, (event, ignore, _) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (!win) return;
    win.setIgnoreMouseEvents(ignore, { forward: true });
  });
}


module.exports = handleEvent