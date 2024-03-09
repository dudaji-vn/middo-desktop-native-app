const { contextBridge, ipcRenderer } = require("electron");
// const { readFileSync } = require("fs");
// const { join } = require("path");

contextBridge.exposeInMainWorld("electron", {});

contextBridge.exposeInMainWorld("ipcRenderer", {
  send: (channel, data) => {
    ipcRenderer.send(channel, data);
  },
  on: (channel, func) => {
    ipcRenderer.on(channel, (event, ...args) => func(...args));
  },
});