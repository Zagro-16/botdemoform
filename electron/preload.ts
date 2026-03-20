import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('botforma', {
  login: (username: string, password: string) => ipcRenderer.invoke('auth:login', { username, password }),
  listCourses: () => ipcRenderer.invoke('courses:list'),
  getCourseDetails: (courseId: number) => ipcRenderer.invoke('courses:details', courseId),
  startAutomation: (courseId: number) => ipcRenderer.invoke('automation:start', courseId),
  confirmSubmission: (courseId: number) => ipcRenderer.invoke('automation:confirmSubmission', courseId),
  importCsv: (courseId: number, csvContent: string) => ipcRenderer.invoke('courses:importCsv', { courseId, csvContent }),
  onAutomationEvent: (callback: () => void) => ipcRenderer.on('automation:event', callback)
});
