// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
  database: {
    query: (query, params) =>
      ipcRenderer.invoke("database-query", { query, params }),
    createInvoice: (data) => ipcRenderer.invoke("create-invoice", data),
  },
  receive: (channel, func) => {
    ipcRenderer.on(channel, (_, ...args) => func(...args));
  },
});
