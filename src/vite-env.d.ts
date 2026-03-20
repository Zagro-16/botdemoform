/// <reference types="vite/client" />

declare global {
  interface Window {
    botforma: {
      login: (username: string, password: string) => Promise<{ username: string; displayName: string }>;
      listCourses: () => Promise<any[]>;
      getCourseDetails: (courseId: number) => Promise<any>;
      startAutomation: (courseId: number) => Promise<{ ok: boolean }>;
      confirmSubmission: (courseId: number) => Promise<{ ok: boolean; message: string }>;
      importCsv: (courseId: number, csvContent: string) => Promise<{ ok: boolean }>;
      onAutomationEvent: (callback: () => void) => void;
    };
  }
}

export {};
