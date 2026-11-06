'use strict';
const { contextBridge, ipcRenderer } = require('electron');
const on = (channel, cb) => ipcRenderer.on(channel, (_event, payload) => cb(payload));
contextBridge.exposeInMainWorld('crawlers', {
  onInit: cb => on('init', cb), onCursor: cb => on('cursor', cb), onScan: cb => on('scan', cb), onCmd: cb => on('cmd', cb),
  ready: () => ipcRenderer.send('ready')
});
