import { BrowserWindow, shell } from 'electron';
import { getCourseDetails, logMessage, markTraineeCompleted, updateCourseStatus } from './database';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const jitter = (base: number) => base + Math.floor(Math.random() * 1200);

export async function runCourseAutomation(mainWindow: BrowserWindow, courseId: number) {
  const details = getCourseDetails(courseId);
  updateCourseStatus(courseId, 'in lavorazione');
  logMessage(courseId, 'info', 'Procedura corso aperta. In attesa di login SPID manuale.');
  mainWindow.webContents.send('automation:event');
  await shell.openExternal(details.spidUrl);

  for (let i = 0; i < details.trainees.length; i += 1) {
    const trainee = details.trainees[i];
    if (trainee.stato === 'compilato') continue;

    logMessage(courseId, 'info', `Apertura scheda corsista ${i + 1} di ${details.trainees.length}`);
    mainWindow.webContents.send('automation:event');
    await wait(jitter(2200));

    logMessage(courseId, 'info', 'Compilazione anagrafica in corso');
    mainWindow.webContents.send('automation:event');
    await wait(jitter(7200));

    logMessage(courseId, 'info', 'Salvataggio dati');
    mainWindow.webContents.send('automation:event');
    await wait(jitter(4800));

    markTraineeCompleted(trainee.id);
    logMessage(courseId, 'success', 'Passaggio al corsista successivo');
    mainWindow.webContents.send('automation:event');
    await wait(jitter(3600));
  }

  updateCourseStatus(courseId, 'in attesa di firma/invio');
  logMessage(courseId, 'warning', 'Compilazione completata – In attesa di firma/invio');
  mainWindow.webContents.send('automation:event');
}
