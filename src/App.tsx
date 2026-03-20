import { useEffect, useMemo, useState } from 'react';

type Level = 'info' | 'success' | 'warning' | 'error';

type Course = {
  id: number;
  title: string;
  code: string;
  status: string;
  spidUrl: string;
  traineeCount: number;
  completedCount: number;
};

type Trainee = {
  id: number;
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
  stato: string;
};

type LogItem = { timestamp: string; level: Level; message: string };
type CourseDetails = Course & { trainees: Trainee[]; logs: LogItem[] };

const statusClass: Record<string, string> = {
  'da compilare': 'neutral',
  'in lavorazione': 'working',
  completato: 'done',
  'in attesa di firma/invio': 'waiting',
  inviato: 'submitted',
  errore: 'error'
};

const workflow = [
  'Login locale BOTFORMA',
  'Selezione corso',
  'Login SPID manuale operatore',
  'Compilazione batch corsisti',
  'Firma / Invia manuale',
  'Invio confermato'
];

export function App() {
  const [user, setUser] = useState<{ displayName: string } | null>(null);
  const [form, setForm] = useState({ username: 'admin', password: 'botforma123' });
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [details, setDetails] = useState<CourseDetails | null>(null);
  const [banner, setBanner] = useState('Benvenuto in BOTFORMA');
  const [csvInput, setCsvInput] = useState('nome,cognome,codice fiscale,data nascita,luogo nascita,residenza,telefono,email,titolo di studio,eventuali documenti\nSara,Conti,CNTSRA95F44H501D,1995-06-04,Roma,Via Roma 2,3331112222,sara.conti@example.it,Laurea,CIE');
  const [busy, setBusy] = useState(false);

  const selectedCourse = useMemo(() => courses.find((course) => course.id === selectedCourseId) ?? null, [courses, selectedCourseId]);
  const progress = details?.traineeCount ? Math.round((details.completedCount / details.traineeCount) * 100) : 0;

  const refreshCourses = async (courseToSelect?: number | null) => {
    const nextCourses = await window.botforma.listCourses();
    setCourses(nextCourses);
    const nextId = courseToSelect ?? selectedCourseId ?? nextCourses[0]?.id ?? null;
    setSelectedCourseId(nextId);
    if (nextId) {
      const nextDetails = await window.botforma.getCourseDetails(nextId);
      setDetails(nextDetails);
    }
  };

  useEffect(() => {
    window.botforma.onAutomationEvent(() => {
      void refreshCourses(selectedCourseId);
    });
  }, [selectedCourseId]);

  useEffect(() => {
    if (user) {
      void refreshCourses();
    }
  }, [user]);

  const handleLogin = async () => {
    try {
      const session = await window.botforma.login(form.username, form.password);
      setUser(session);
      setBanner('Login locale eseguito correttamente. Ambiente operativo pronto.');
    } catch (error) {
      setBanner((error as Error).message);
    }
  };

  const selectCourse = async (courseId: number) => {
    setSelectedCourseId(courseId);
    const nextDetails = await window.botforma.getCourseDetails(courseId);
    setDetails(nextDetails);
  };

  const startAutomation = async () => {
    if (!selectedCourseId) return;
    setBusy(true);
    setBanner('Avvio procedura corso e attesa login SPID manuale.');
    try {
      await window.botforma.startAutomation(selectedCourseId);
      await refreshCourses(selectedCourseId);
      setBanner('Compilazione completata – In attesa di firma/invio');
    } catch (error) {
      setBanner((error as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const confirmSubmission = async () => {
    if (!selectedCourseId) return;
    setBusy(true);
    try {
      const result = await window.botforma.confirmSubmission(selectedCourseId);
      await refreshCourses(selectedCourseId);
      setBanner(result.message);
    } finally {
      setBusy(false);
    }
  };

  const importCsv = async () => {
    if (!selectedCourseId) return;
    setBusy(true);
    try {
      await window.botforma.importCsv(selectedCourseId, csvInput);
      await refreshCourses(selectedCourseId);
      setBanner('CSV importato e validato con successo.');
    } catch (error) {
      setBanner((error as Error).message);
    } finally {
      setBusy(false);
    }
  };

  if (!user) {
    return (
      <div className="login-shell">
        <div className="login-card premium-card">
          <div className="brand-mark">BF</div>
          <div>
            <p className="eyebrow">BOTFORMA enterprise desktop</p>
            <h1>Automazione assistita per enti di formazione</h1>
            <p className="subtitle">Interfaccia desktop elegante, database SQLite locale, backup automatici, log integrati e conferma finale umana.</p>
          </div>
          <div className="feature-strip">
            <span>Setup.exe</span>
            <span>SQLite locale</span>
            <span>Backup automatico</span>
            <span>Nessuna dipendenza lato ente</span>
          </div>
          <label>
            Username
            <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
          </label>
          <label>
            Password
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </label>
          <button onClick={handleLogin}>Accedi al software</button>
          <p className="hint">Credenziali demo: admin / botforma123</p>
          <div className="banner">{banner}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <aside className="sidebar premium-card">
        <div>
          <div className="brand-row">
            <div className="brand-mark small">BF</div>
            <div>
              <p className="eyebrow">BOTFORMA</p>
              <h2>{user.displayName}</h2>
            </div>
          </div>
          <p className="subtitle">Applicativo desktop Windows pronto per installazione guidata, uso locale e avvio da icona desktop.</p>
        </div>

        <div className="workflow-box">
          <h3>Workflow operativo</h3>
          {workflow.map((step, index) => (
            <div key={step} className={`workflow-step ${index < 2 ? 'active' : ''}`}>
              <strong>{index + 1}</strong>
              <span>{step}</span>
            </div>
          ))}
        </div>

        <div className="course-list">
          {courses.map((course) => (
            <button key={course.id} className={`course-item ${course.id === selectedCourseId ? 'active' : ''}`} onClick={() => void selectCourse(course.id)}>
              <strong>{course.title}</strong>
              <span>{course.code}</span>
              <span className={`pill ${statusClass[course.status]}`}>{course.status}</span>
              <small>{course.completedCount}/{course.traineeCount} corsisti completati</small>
            </button>
          ))}
        </div>
      </aside>

      <main className="content">
        <header className="hero premium-card">
          <div>
            <p className="eyebrow">Dashboard corsi</p>
            <h1>{selectedCourse?.title ?? 'Seleziona un corso'}</h1>
            <p>{banner}</p>
          </div>
          <div className="hero-actions">
            <button disabled={busy || !selectedCourseId} onClick={startAutomation}>Avvia compilazione corso</button>
            <button className="secondary" disabled={busy || details?.status !== 'in attesa di firma/invio'} onClick={confirmSubmission}>Firma / Invia</button>
          </div>
        </header>

        <section className="stats-grid">
          <article className="premium-card">
            <span>Stato corso</span>
            <strong>{details?.status ?? '-'}</strong>
          </article>
          <article className="premium-card">
            <span>Codice corso</span>
            <strong>{details?.code ?? '-'}</strong>
          </article>
          <article className="premium-card">
            <span>Avanzamento batch</span>
            <strong>{details ? `${details.completedCount}/${details.traineeCount}` : '-'}</strong>
          </article>
          <article className="premium-card">
            <span>Modalità operativa</span>
            <strong>Login SPID manuale</strong>
          </article>
        </section>

        <section className="grid two-columns">
          <div className="panel premium-card">
            <div className="panel-header">
              <div>
                <h3>Controllo esecuzione</h3>
                <span>Compilazione progressiva singola con ritmo umano simulato</span>
              </div>
              <div className="progress-box">
                <strong>{progress}%</strong>
                <div className="progress-bar"><div style={{ width: `${progress}%` }} /></div>
              </div>
            </div>

            <div className="mini-grid">
              <div className="info-card">
                <span>Tempo medio per corsista</span>
                <strong>~20 secondi</strong>
              </div>
              <div className="info-card">
                <span>Passo finale</span>
                <strong>Presidio umano obbligatorio</strong>
              </div>
              <div className="info-card">
                <span>Backup locale</span>
                <strong>Automatico</strong>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Corsista</th>
                  <th>CF</th>
                  <th>Contatti</th>
                  <th>Titolo</th>
                  <th>Stato</th>
                </tr>
              </thead>
              <tbody>
                {details?.trainees.map((trainee) => (
                  <tr key={trainee.id}>
                    <td>
                      <strong>{trainee.nome} {trainee.cognome}</strong>
                      <div className="table-subtext">{trainee.dataNascita} · {trainee.luogoNascita}</div>
                    </td>
                    <td>{trainee.codiceFiscale}</td>
                    <td>
                      <div>{trainee.email}</div>
                      <div className="table-subtext">{trainee.telefono}</div>
                    </td>
                    <td>{trainee.titoloStudio}</td>
                    <td><span className={`pill ${trainee.stato === 'compilato' ? 'done' : 'neutral'}`}>{trainee.stato}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="stack">
            <div className="panel premium-card">
              <div className="panel-header">
                <div>
                  <h3>Import CSV</h3>
                  <span>Validazione locale e associazione corsisti al corso selezionato</span>
                </div>
              </div>
              <textarea value={csvInput} onChange={(e) => setCsvInput(e.target.value)} rows={8} />
              <button className="secondary" disabled={busy || !selectedCourseId} onClick={importCsv}>Importa CSV</button>
            </div>

            <div className="panel premium-card">
              <div className="panel-header">
                <div>
                  <h3>Messaggi in tempo reale</h3>
                  <span>Log operazioni e stato avanzamento</span>
                </div>
              </div>
              <div className="log-list">
                {details?.logs.map((log, index) => (
                  <div key={`${log.timestamp}-${index}`} className={`log-item ${log.level}`}>
                    <strong>{new Date(log.timestamp).toLocaleString('it-IT')}</strong>
                    <span>{log.message}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="panel premium-card accent-panel">
              <div className="panel-header">
                <div>
                  <h3>Pacchetto consegna ente</h3>
                  <span>Installazione facilitata da cartella estratta</span>
                </div>
              </div>
              <ul className="check-list">
                <li>BOTFORMA-Setup.exe nel pacchetto finale</li>
                <li>Installa-BOTFORMA.bat per avvio rapido installazione</li>
                <li>Avvio successivo da icona desktop</li>
                <li>Dati, log e backup gestiti in locale</li>
              </ul>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
