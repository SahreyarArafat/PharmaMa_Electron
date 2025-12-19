const { app, BrowserWindow, Menu, globalShortcut } = require("electron");
const path = require("node:path");
const { exec } = require("child_process");
const fs = require("fs");
require("dotenv").config();
// electron-reload is only for Dev purpuse. So, it should be removed before make a built.
require("electron-reload")(__dirname, {
  electron: path.join(__dirname, "node_modules", ".bin", "electron"),
});

const { syncInvoices } = require("./backend/syncService");

let mainWindow;
let backendProcess;

const backendPath = app.isPackaged
  ? path.join(process.resourcesPath, "backend")
  : path.join(__dirname, "backend");

// Function to start the backend (using nodemon in dev, node in prod)
const startBackend = () => {
  return new Promise((resolve, reject) => {
    const command = app.isPackaged ? "node server.js" : "nodemon server.js";

    backendProcess = exec(
      command,
      {
        cwd: backendPath,
      },
      (error, stdout, stderr) => {
        if (error) {
          console.error(`❌ Backend Error: ${error.message}`);
          reject(error);
        }
        if (stderr) {
          console.error(`Backend stderr: ${stderr}`);
        }
      }
    );

    backendProcess.stdout.on("data", (data) => {
      console.log(`Backend: ${data}`);
      if (data.includes("✅ Server running")) {
        resolve();
      }
    });

    backendProcess.on("error", (err) => {
      console.error("❌ Failed to start backend process:", err);
      reject(err);
    });
  });
};

// Function to create the Electron window
const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 600,
    title: "PharmaMa",
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadFile(path.join(__dirname, "index.html"));

  globalShortcut.register("CommandOrControl+Shift+I", () => {
    mainWindow.webContents.openDevTools();
  });

  Menu.setApplicationMenu(null); // Remove default menu
};

// Main app logic
app.whenReady().then(async () => {
  try {
    await startBackend();
    console.log("✅ Backend started successfully!");
    createWindow();

    // Sync invoices in every `second * minute * mili-second`
    setInterval(syncInvoices, 60 * 30 * 1000);
  } catch (error) {
    console.error("❌ Failed to start backend:", error);
  }

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (backendProcess) backendProcess.kill();
  if (process.platform !== "darwin") app.quit();
});
