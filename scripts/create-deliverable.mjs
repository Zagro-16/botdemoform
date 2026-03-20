import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';

const root = process.cwd();
const releaseDir = path.join(root, 'release');
const deliverablesDir = path.join(root, 'deliverables');
const packageDir = path.join(deliverablesDir, 'BOTFORMA-Windows');
const zipPath = path.join(deliverablesDir, 'BOTFORMA-Windows.zip');

if (!fs.existsSync(releaseDir)) {
  throw new Error('Cartella release/ non trovata. Eseguire prima npm run dist:win');
}

fs.rmSync(packageDir, { recursive: true, force: true });
fs.mkdirSync(packageDir, { recursive: true });

const setupExe = fs.readdirSync(releaseDir).find((file) => /setup.*\.exe$/i.test(file));
const portableExe = fs.readdirSync(releaseDir).find((file) => /portable.*\.exe$/i.test(file));

if (!setupExe) {
  throw new Error('Installer Setup.exe non trovato nella cartella release/.');
}

fs.copyFileSync(path.join(releaseDir, setupExe), path.join(packageDir, 'BOTFORMA-Setup.exe'));
if (portableExe) {
  fs.copyFileSync(path.join(releaseDir, portableExe), path.join(packageDir, 'BOTFORMA-Portable.exe'));
}

const launcher = `@echo off
cd /d %~dp0
echo Avvio installazione BOTFORMA...
start "" "BOTFORMA-Setup.exe"
`;
fs.writeFileSync(path.join(packageDir, 'Installa-BOTFORMA.bat'), launcher, 'utf8');

const readme = `BOTFORMA - Pacchetto Windows\r\n\r\n1. Estrarre l'intero contenuto della cartella zip.\r\n2. Fare doppio click su Installa-BOTFORMA.bat oppure BOTFORMA-Setup.exe.\r\n3. Completare il setup guidato.\r\n4. Avviare BOTFORMA dall'icona desktop.\r\n\r\nNote:\r\n- Database locale SQLite, backup automatici e log sono creati sul PC utente.\r\n- Nessun Node.js, npm o database esterno è richiesto sul PC finale.\r\n`;
fs.writeFileSync(path.join(packageDir, 'LEGGIMI-INSTALLAZIONE.txt'), readme, 'utf8');

fs.rmSync(zipPath, { force: true });
execFileSync('zip', ['-r', zipPath, 'BOTFORMA-Windows'], { cwd: deliverablesDir, stdio: 'inherit' });
console.log(`Pacchetto creato: ${zipPath}`);
