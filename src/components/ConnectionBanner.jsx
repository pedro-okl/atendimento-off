import { isSupabaseConfigured } from '../services/supabaseClient';
import { formatShortTime } from '../utils/date';

export function ConnectionBanner({ isOnline, syncState, onSync }) {
  const lastSync = formatShortTime(syncState.lastSyncedAt);

  return (
    <section className="connection-bar" aria-label="Estado da aplicacao">
      <div className={isOnline ? 'connection-pill online' : 'connection-pill offline'}>
        <span>{isOnline ? 'Online' : 'Offline'}</span>
      </div>

      <div className={isSupabaseConfigured ? 'connection-pill database-ok' : 'connection-pill database-missing'}>
        <span>{isSupabaseConfigured ? 'Supabase pronto' : 'Configurar Supabase'}</span>
      </div>

      <button
        type="button"
        className="icon-button sync-button"
        onClick={onSync}
        disabled={!isOnline || syncState.running}
        title="Sincronizar agora"
        aria-label="Sincronizar agora"
      >
        <span className={syncState.running ? 'spin-text' : undefined}>Atualizar</span>
      </button>

      {lastSync ? <span className="last-sync">Atualizado {lastSync}</span> : null}
    </section>
  );
}
