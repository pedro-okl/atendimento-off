import { HeartHandshake, MapPinned, NotebookPen } from 'lucide-react';
import { AttendanceForm } from '../components/AttendanceForm';
import { AttendanceList } from '../components/AttendanceList';
import { ConnectionBanner } from '../components/ConnectionBanner';
import { Dashboard } from '../components/Dashboard';
import { useAttendances } from '../hooks/useAttendances';

export function HomePage() {
  const {
    attendances,
    dashboard,
    loading,
    isOnline,
    syncState,
    addAttendance,
    syncNow
  } = useAttendances();

  return (
    <main className="app-shell">
      <header className="app-header">
        <div className="brand-cluster">
          <div className="brand-mark" aria-hidden="true">
            <HeartHandshake size={24} strokeWidth={2.2} />
          </div>
          <div>
            <p className="eyebrow">ONG Social</p>
            <h1>Atendimentos Offline</h1>
          </div>
        </div>

        <div className="field-note" aria-label="Resumo do aplicativo">
          <span className="field-note-pin" aria-hidden="true">
            <MapPinned size={16} />
          </span>
          <p>
            Um caderno de campo para guardar cada atendimento no aparelho e sincronizar quando a
            internet voltar.
          </p>
          <NotebookPen className="field-note-icon" size={21} aria-hidden="true" />
        </div>
      </header>

      <ConnectionBanner isOnline={isOnline} syncState={syncState} onSync={syncNow} />

      {syncState.error ? <div className="sync-alert">{syncState.error}</div> : null}

      <Dashboard dashboard={dashboard} />

      <AttendanceForm onAdd={addAttendance} />

      <AttendanceList
        attendances={attendances}
        loading={loading}
        onSync={syncNow}
        syncRunning={syncState.running}
      />
    </main>
  );
}
