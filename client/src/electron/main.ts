import { app, BrowserWindow, dialog, ipcMain, shell } from 'electron'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { writeFile } from 'node:fs/promises'

const currentFileName = fileURLToPath(import.meta.url)
const currentDirName = dirname(currentFileName)

function createWindow() {
  const window = new BrowserWindow({
    width: 1600,
    height: 1020,
    minWidth: 1280,
    minHeight: 860,
    backgroundColor: '#0f1728',
    title: 'Expert System Workbench',
    webPreferences: {
      preload: join(currentDirName, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  })

  if (!app.isPackaged) {
    void window.loadURL('http://localhost:5173')
  } else {
    void window.loadFile(join(app.getAppPath(), 'dist', 'index.html'))
  }
}

ipcMain.handle('dialog:save-json', async (_event, payload: { fileName: string; content: string }) => {
  const { canceled, filePath } = await dialog.showSaveDialog({
    title: 'Сохранить экспертную систему',
    defaultPath: payload.fileName,
    filters: [{ name: 'JSON', extensions: ['json'] }],
  })

  if (canceled || !filePath) {
    return { canceled: true as const }
  }

  await writeFile(filePath, payload.content, 'utf8')

  return { canceled: false as const, filePath }
})

ipcMain.handle('shell:open-external', async (_event, url: string) => {
  await shell.openExternal(url)
})

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})