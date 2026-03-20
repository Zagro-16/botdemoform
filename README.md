# BOTFORMA

BOTFORMA è un'applicazione desktop Windows pensata per enti di formazione, progettata per essere distribuita come software installabile con `Setup.exe`, utilizzabile senza Node.js, npm, localhost o database esterni sul PC finale.

## Cosa include
- Login locale software.
- Dashboard corsi con stati: `da compilare`, `in lavorazione`, `completato`, `in attesa di firma/invio`, `inviato`, `errore`.
- Gestione corsisti, associazione ai corsi, import CSV e validazione locale.
- Database SQLite incorporato con backup automatici e log operativi.
- Motore di compilazione assistita che si arresta prima del passaggio sensibile finale.
- Pulsante manuale `Firma / Invia` e conferma finale `Invio confermato`.
- Script per creare un pacchetto finale `.zip` pensato per la consegna all'ente dopo la build Windows.

## Stack tecnico
- Electron desktop shell
- React + Vite per l'interfaccia desktop
- TypeScript
- SQLite locale con `better-sqlite3`
- `electron-builder` per il packaging Windows

## Flusso utente coperto
1. Apertura BOTFORMA.
2. Login locale.
3. Selezione corso.
4. Avvio compilazione corso.
5. Login SPID manuale dell'operatore sul portale esterno.
6. Compilazione automatica progressiva dei corsisti.
7. Arresto in stato `in attesa di firma/invio`.
8. Click umano su `Firma / Invia`.
9. Visualizzazione del messaggio `Invio confermato`.

## Sviluppo
```bash
npm install
npm run dev
```

## Build Windows
```bash
npm run dist:win
```

L'output atteso viene scritto nella cartella `release/` con installer NSIS e build portabile.

## Pacchetto finale consegna ente
Dopo aver generato la build Windows, creare il pacchetto consegnabile con:

```bash
npm run package:deliverable
```

Questo comando crea:
- `deliverables/BOTFORMA-Windows/`
- `deliverables/BOTFORMA-Windows.zip`

All'interno del pacchetto vengono preparati:
- `BOTFORMA-Setup.exe`
- `Installa-BOTFORMA.bat`
- `LEGGIMI-INSTALLAZIONE.txt`

L'obiettivo è far sì che l'ente estragga il `.zip`, faccia doppio click su `Installa-BOTFORMA.bat` o `BOTFORMA-Setup.exe`, completi il setup guidato e poi avvii BOTFORMA dall'icona desktop.
