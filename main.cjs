const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

async function postJson(url, body, timeoutMs = 120000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    const text = await response.text();
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }

    return {
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      data,
    };
  } catch (error) {
    if (error?.name === 'AbortError') {
      throw new Error(`Local endpoint timeout: ${url}`);
    }
    throw new Error(`Local endpoint unreachable: ${url} (${error?.message || error})`);
  } finally {
    clearTimeout(timeout);
  }
}

ipcMain.handle('local-llm:request', async (_event, payload) => {
  const { url, body, timeoutMs } = payload || {};
  if (!url || !body) {
    throw new Error('Invalid local LLM request payload.');
  }
  return postJson(url, body, timeoutMs);
});

function createWindow() {
  const win = new BrowserWindow({
    width: 1600,
    height: 1000,
    autoHideMenuBar: true,
    icon: path.join(__dirname, 'icon.ico'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false,
      preload: path.join(__dirname, 'preload.cjs')
    }
  });

  win.loadFile(path.join(__dirname, 'dist', 'index.html'));
}

app.whenReady().then(() => {
  if (process.platform === 'win32') {
    app.setAppUserModelId('com.ure.dashboard');
  }
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
