const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronLocalLlm', {
  request: (payload) => ipcRenderer.invoke('local-llm:request', payload),
});
