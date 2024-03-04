const { app, BrowserWindow, ipcMain, Notification } = require("electron");
const path = require("path");
const url = require("url");

function createWindow() {
  const mainWindow = new BrowserWindow({
    title: "Middo",
    width: 800,
    height: 600,
    webPreferences: {
        contextIsolation: true,
        nodeIntegration: true,
        preload: path.join(__dirname, 'preload.js')
    }
  });
  mainWindow.webContents.openDevTools();
  const startURL = url.format({
    pathname: path.join(__dirname, "./app/dist/index.html"),
    protocol: "file",
  });
  mainWindow.loadURL("http://localhost:3000");
//   mainWindow.loadURL(startURL);
}

app.whenReady().then(()=>{
  createWindow();
});

ipcMain.on('send-message', (event, args) => {
    console.log(args)
    event.reply('reply-message', 'Hello from main process')
})
ipcMain.on('notify', (event, args) => {
  new Notification({title: 'Notification', body: "Hiii"}).show()
})