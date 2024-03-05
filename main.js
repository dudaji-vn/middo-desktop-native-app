const { app, BrowserWindow, ipcMain, Notification, screen } = require("electron");
const electron = require("electron");
const path = require("path");
const url = require("url");
const { setup: setupPushReceiver } = require('electron-push-receiver');

// Call it before 'did-finish-load' with mainWindow a reference to your window
const handleEvents = require("./handle-event");

function createWindow() {
  const screenSize = screen.getPrimaryDisplay().workAreaSize;
  const mainWindow = new BrowserWindow({
    title: "Middo",
    // backgroundColor: '#2e2c29',
    width: screenSize.width ,
    height: screenSize.height,
    // alwaysOnTop: true,
    webPreferences: {
        contextIsolation: true,
        nodeIntegration: true,
        preload: path.join(__dirname, 'preload.js'),
    }
  });
  setupPushReceiver(mainWindow.webContents);
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
app.setAsDefaultProtocolClient("middo")
handleEvents();