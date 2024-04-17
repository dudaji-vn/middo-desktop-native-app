const { globalShortcut } = require("electron");
function setupShortcut(mainWindow) {
  
  mainWindow.on('focus', () => {
    globalShortcut.register('f5', function () {
      mainWindow.reload()
    })
    globalShortcut.register('CommandOrControl+R', function () {
      mainWindow.reload()
    })
  });
  mainWindow.on('blur', () => {
    globalShortcut.unregisterAll(mainWindow);
  });
}
module.exports = setupShortcut;
