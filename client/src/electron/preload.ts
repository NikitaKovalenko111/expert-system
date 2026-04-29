import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  saveJson: (payload: { fileName: string; content: string }) => ipcRenderer.invoke('dialog:save-json', payload),
  openExternal: (url: string) => ipcRenderer.invoke('shell:open-external', url),
  platform: process.platform,
})