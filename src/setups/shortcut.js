const { globalShortcut } = require("electron");
function setupShortcut(mainWindow) {
  globalShortcut.register('f5', function () {
    mainWindow.reload()
  })
  globalShortcut.register('CommandOrControl+R', function () {
    mainWindow.reload()
  })
}
module.exports = setupShorcut;
