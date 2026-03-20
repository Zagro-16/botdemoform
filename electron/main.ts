import { app, BrowserWindow, dialog, ipcMain } from 'electron';
import path from 'path';
import log from 'electron-log';
import { initDatabase, getCourseDetails, importCsv, listCourses, markCourseSubmitted, validateUser } from './database';
import { runCourseAutomation } from './automation';

let mainWindow: BrowserWindow | null = null;
let automationRunning = false;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1500,
    height: 960,
    minWidth: 1280,
    minHeight: 820,
    backgroundColor: '#eef3fb',
    title: 'BOTFORMA',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  const url = app.isPackaged
    ? `file://${path.join(__dirname, '../dist/index.html')}`
    : 'http://localhost:5173';

  mainWindow.loadURL(url);
}

app.whenReady().then(() => {
  log.initialize();
  initDatabase();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('auth:login', async (_event, credentials) => {
  const user = validateUser(credentials.username, credentials.password);
  if (!user) {
    throw new Error('Credenziali non valide. Usa admin / botforma123.');
  }
  return user;
});

ipcMain.handle('courses:list', async () => listCourses());
ipcMain.handle('courses:details', async (_event, courseId: number) => getCourseDetails(courseId));

ipcMain.handle('automation:start', async (_event, courseId: number) => {
  if (!mainWindow) return;
  if (automationRunning) {
    throw new Error('È già in esecuzione una compilazione batch.');
  }
  automationRunning = true;
  try {
    await dialog.showMessageBox(mainWindow, {
      type: 'info',
      title: 'Login SPID manuale',
      message: 'Si aprirà il portale esterno. Effettuare il login SPID manualmente e poi lasciare proseguire BOTFORMA.'
    });
    await runCourseAutomation(mainWindow, courseId);
    return { ok: true };
  } finally {
    automationRunning = false;
  }
});

ipcMain.handle('automation:confirmSubmission', async (_event, courseId: number) => {
  markCourseSubmitted(courseId);
  return { ok: true, message: 'Invio confermato' };
});

ipcMain.handle('courses:importCsv', async (_event, payload) => {
  importCsv(payload.courseId, payload.csvContent);
  return { ok: true };
});
