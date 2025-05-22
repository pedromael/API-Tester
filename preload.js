const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  minimize: () => ipcRenderer.send('window:minimize'),
  maximize: () => ipcRenderer.send('window:maximize'),
  close: () => ipcRenderer.send('window:close')
});

const { shell } = require('electron');

// Adiciona um ouvinte para todos os links
document.addEventListener('click', function (e) {
  const target = e.target.closest('a');
  if (target && target.href.startsWith('http')) {
    e.preventDefault();
    shell.openExternal(target.href);
  }
});