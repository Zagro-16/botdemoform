export type CourseStatus =
  | 'da compilare'
  | 'in lavorazione'
  | 'completato'
  | 'in attesa di firma/invio'
  | 'inviato'
  | 'errore';

export interface UserSession {
  username: string;
  displayName: string;
}

export interface Course {
  id: number;
  title: string;
  code: string;
  status: CourseStatus;
  spidUrl: string;
  traineeCount: number;
  completedCount: number;
}

export interface Trainee {
  id: number;
  courseId: number;
  nome: string;
  cognome: string;
  codiceFiscale: string;
  dataNascita: string;
  luogoNascita: string;
  residenza: string;
  telefono: string;
  email: string;
  titoloStudio: string;
  documenti: string;
  stato: 'pronto' | 'compilato' | 'errore';
}

export interface QueueMessage {
  timestamp: string;
  level: 'info' | 'success' | 'warning' | 'error';
  message: string;
}

export interface CourseDetails extends Course {
  trainees: Trainee[];
  logs: QueueMessage[];
}
