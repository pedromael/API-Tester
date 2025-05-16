const { app, protocol, BrowserWindow } = require('electron');
const path = require('path');

app.whenReady().then(() => {
    // Registra um esquema 'app://' que mapeia para arquivos locais
    protocol.registerFileProtocol('app', (req, cb) => {
    let url = req.url.replace('app:///', '');
    cb({ path: path.join(__dirname, url) });
    });

    const win = new BrowserWindow({
        width: 900,
        height: 700,
        minWidth: 800,
        minHeight: 600,
        webPreferences: {
        nodeIntegration: true
        }
    });

    win.loadFile(path.join(__dirname, 'src', 'index.html'));
});