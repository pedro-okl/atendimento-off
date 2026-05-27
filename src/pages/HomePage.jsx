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
        <div className="brand-mark" aria-hidden="true">AS</div>
        <div>
          <p>ONG Social</p>
          <h1>Atendimentos Offline</h1>
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
