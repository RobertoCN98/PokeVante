const { app, BrowserWindow } = require("electron");
const path = require("path");
const isDev = !app.isPackaged;
function createWindow() {
    const win = new BrowserWindow({
        width: 420,
        height: 760,
        backgroundColor: "#000000",
        autoHideMenuBar: true,
        webPreferences: {
            // Seguridad básica recomendada
            contextIsolation: true,
            nodeIntegration: false
        }
    });
    if (isDev) {
        win.loadURL("http://localhost:5173");
        win.webContents.openDevTools({ mode: "detach" });
    } else {
        // Carga la build de Vite
        win.loadFile(path.join(__dirname, "../dist/index.html"));
    }
}
app.whenReady().then(() => {
    createWindow();
    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});
app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});