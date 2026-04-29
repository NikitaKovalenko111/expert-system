export {}

declare global {
  interface Window {
    electronAPI?: {
      saveJson: (payload: { fileName: string; content: string }) => Promise<{ canceled: boolean; filePath?: string }>
      openExternal: (url: string) => Promise<void>
      platform: string
    }
  }
}