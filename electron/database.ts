import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { app } from 'electron';
import { Course, CourseDetails, CourseStatus, QueueMessage, Trainee } from './types';

let db: Database.Database;

const dataDir = () => path.join(app.getPath('userData'), 'data');
const dbPath = () => path.join(dataDir(), 'botforma.sqlite');
const backupDir = () => path.join(app.getPath('userData'), 'backup');

export function logMessage(courseId: number, level: QueueMessage['level'], message: string) {
  db.prepare('INSERT INTO logs (course_id, level, message, created_at) VALUES (?, ?, ?, ?)').run(courseId, level, message, new Date().toISOString());
}

function seed() {
  const users = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  if (users.count > 0) return;

  db.prepare('INSERT INTO users (username, password, display_name) VALUES (?, ?, ?)').run('admin', 'botforma123', 'Operatore BOTFORMA');

  const insertCourse = db.prepare('INSERT INTO courses (title, code, status, spid_url) VALUES (?, ?, ?, ?)');
  const courseIds = [
    Number(insertCourse.run('Corso OSS 2026', 'OSS-2026-01', 'da compilare', 'https://portale.example.local/oss').lastInsertRowid),
    Number(insertCourse.run('Corso Sicurezza Cantieri', 'CAN-2026-02', 'in attesa di firma/invio', 'https://portale.example.local/cantieri').lastInsertRowid),
    Number(insertCourse.run('Corso Segreteria Digitale', 'SD-2026-03', 'completato', 'https://portale.example.local/segreteria').lastInsertRowid)
  ];

  const insertTrainee = db.prepare(`INSERT INTO trainees (
    course_id, nome, cognome, codice_fiscale, data_nascita, luogo_nascita, residenza, telefono, email, titolo_studio, documenti, stato
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

  const sample = [
    ['Mario', 'Rossi', 'RSSMRA90A01H501Z'],
    ['Lucia', 'Bianchi', 'BNCLCU91B41F205Y'],
    ['Paolo', 'Verdi', 'VRDPLA89C12L219Q'],
    ['Giulia', 'Neri', 'NREGLI92D52H703V'],
    ['Anna', 'Gallo', 'GLLNNA93E43F839X']
  ];

  courseIds.forEach((courseId, index) => {
    sample.forEach((person, sampleIndex) => {
      insertTrainee.run(
        courseId,
        person[0],
        person[1],
        `${person[2].slice(0, 12)}${index}${sampleIndex}`.slice(0, 16),
        `199${sampleIndex}-0${(sampleIndex % 8) + 1}-1${sampleIndex}`,
        'Roma',
        'Via Demo 10, Roma',
        `32000000${index}${sampleIndex}`,
        `${person[0].toLowerCase()}.${person[1].toLowerCase()}@botforma.it`,
        'Diploma',
        'Carta identità; Tessera sanitaria',
        index === 1 || index === 2 ? 'compilato' : 'pronto'
      );
    });
  });

  logMessage(courseIds[1], 'warning', 'Compilazione completata – In attesa di firma/invio');
  logMessage(courseIds[2], 'success', 'Corso demo completato.');
}

function recalcCourseCounts() {
  const courseIds = db.prepare('SELECT id FROM courses').all() as { id: number }[];
  const countStmt = db.prepare("SELECT COUNT(*) as count, SUM(CASE WHEN stato = 'compilato' THEN 1 ELSE 0 END) as completed FROM trainees WHERE course_id = ?");
  const updateStmt = db.prepare('UPDATE courses SET trainee_count = ?, completed_count = ? WHERE id = ?');
  courseIds.forEach(({ id }) => {
    const row = countStmt.get(id) as { count: number; completed: number | null };
    updateStmt.run(row.count, row.completed ?? 0, id);
  });
}

export function initDatabase() {
  fs.mkdirSync(dataDir(), { recursive: true });
  fs.mkdirSync(backupDir(), { recursive: true });
  db = new Database(dbPath());
  db.pragma('journal_mode = WAL');
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      display_name TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS courses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      code TEXT NOT NULL,
      status TEXT NOT NULL,
      spid_url TEXT NOT NULL,
      trainee_count INTEGER NOT NULL DEFAULT 0,
      completed_count INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS trainees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course_id INTEGER NOT NULL,
      nome TEXT NOT NULL,
      cognome TEXT NOT NULL,
      codice_fiscale TEXT NOT NULL,
      data_nascita TEXT NOT NULL,
      luogo_nascita TEXT NOT NULL,
      residenza TEXT NOT NULL,
      telefono TEXT NOT NULL,
      email TEXT NOT NULL,
      titolo_studio TEXT NOT NULL,
      documenti TEXT NOT NULL,
      stato TEXT NOT NULL DEFAULT 'pronto',
      FOREIGN KEY(course_id) REFERENCES courses(id)
    );
    CREATE TABLE IF NOT EXISTS logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course_id INTEGER,
      level TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);
  seed();
  recalcCourseCounts();
  createBackup();
}

export function createBackup() {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const target = path.join(backupDir(), `botforma-backup-${stamp}.sqlite`);
  fs.copyFileSync(dbPath(), target);
}

export function validateUser(username: string, password: string) {
  return db.prepare('SELECT username, display_name as displayName FROM users WHERE username = ? AND password = ?').get(username, password) as { username: string; displayName: string } | undefined;
}

export function listCourses(): Course[] {
  return db.prepare('SELECT id, title, code, status, spid_url as spidUrl, trainee_count as traineeCount, completed_count as completedCount FROM courses ORDER BY id').all() as Course[];
}

export function getCourseDetails(courseId: number): CourseDetails {
  const course = db.prepare('SELECT id, title, code, status, spid_url as spidUrl, trainee_count as traineeCount, completed_count as completedCount FROM courses WHERE id = ?').get(courseId) as Course;
  const trainees = db.prepare(`SELECT id, course_id as courseId, nome, cognome, codice_fiscale as codiceFiscale, data_nascita as dataNascita, luogo_nascita as luogoNascita, residenza, telefono, email, titolo_studio as titoloStudio, documenti, stato FROM trainees WHERE course_id = ? ORDER BY id`).all(courseId) as Trainee[];
  const logs = db.prepare('SELECT created_at as timestamp, level, message FROM logs WHERE course_id = ? ORDER BY id DESC LIMIT 50').all(courseId) as QueueMessage[];
  return { ...course, trainees, logs };
}

export function updateCourseStatus(courseId: number, status: CourseStatus) {
  db.prepare('UPDATE courses SET status = ? WHERE id = ?').run(status, courseId);
}

export function markTraineeCompleted(traineeId: number) {
  db.prepare("UPDATE trainees SET stato = 'compilato' WHERE id = ?").run(traineeId);
  recalcCourseCounts();
}

export function markCourseSubmitted(courseId: number) {
  updateCourseStatus(courseId, 'inviato');
  logMessage(courseId, 'success', 'Invio confermato');
  createBackup();
}

export function importCsv(courseId: number, csvContent: string) {
  const lines = csvContent.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (lines.length < 2) {
    throw new Error('CSV vuoto o privo di righe dati.');
  }
  const [header, ...rows] = lines;
  const columns = header.split(',').map((value) => value.trim().toLowerCase());
  const required = ['nome', 'cognome', 'codice fiscale', 'data nascita', 'luogo nascita', 'residenza', 'telefono', 'email', 'titolo di studio', 'eventuali documenti'];
  const missing = required.filter((name) => !columns.includes(name));
  if (missing.length) {
    throw new Error(`Colonne mancanti: ${missing.join(', ')}`);
  }

  const idx = (name: string) => columns.indexOf(name);
  const stmt = db.prepare(`
    INSERT INTO trainees (course_id, nome, cognome, codice_fiscale, data_nascita, luogo_nascita, residenza, telefono, email, titolo_studio, documenti, stato)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pronto')
  `);

  rows.forEach((row) => {
    const parts = row.split(',').map((value) => value.trim());
    stmt.run(
      courseId,
      parts[idx('nome')],
      parts[idx('cognome')],
      parts[idx('codice fiscale')],
      parts[idx('data nascita')],
      parts[idx('luogo nascita')],
      parts[idx('residenza')],
      parts[idx('telefono')],
      parts[idx('email')],
      parts[idx('titolo di studio')],
      parts[idx('eventuali documenti')] || ''
    );
  });

  recalcCourseCounts();
  logMessage(courseId, 'success', `Import CSV completato: ${rows.length} corsisti aggiunti.`);
  createBackup();
}
