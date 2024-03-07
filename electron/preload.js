const { contextBridge, ipcRenderer } = require("electron");
const { readFileSync } = require("fs");
const { join } = require("path");

window.addEventListener("DOMContentLoaded", () => {
  const rendererScript = document.createElement("script");
  rendererScript.text = readFileSync(join(__dirname, "renderer.js"), "utf8");
  document.body.appendChild(rendererScript);
});

contextBridge.exposeInMainWorld("electron", {});

contextBridge.exposeInMainWorld("ipcRenderer", {
  send: (channel, data) => {
    ipcRenderer.send(channel, data);
  },
  on: (channel, func) => {
    ipcRenderer.on(channel, (event, ...args) => func(...args));
  },
});