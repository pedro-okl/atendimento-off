import { Database, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { isSupabaseConfigured } from '../services/supabaseClient';
import { formatShortTime } from '../utils/date';

export function ConnectionBanner({ isOnline, syncState, onSync }) {
  const lastSync = formatShortTime(syncState.lastSyncedAt);

  return (
    <section className="connection-bar" aria-label="Estado da aplicacao">
      <div className={isOnline ? 'connection-pill online' : 'connection-pill offline'}>
        {isOnline ? <Wifi size={17} aria-hidden="true" /> : <WifiOff size={17} aria-hidden="true" />}
        <span>{isOnline ? 'Online' : 'Offline'}</span>
      </div>

      <div className={isSupabaseConfigured ? 'connection-pill database-ok' : 'connection-pill database-missing'}>
        <Database size={17} aria-hidden="true" />
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
        <RefreshCw className={syncState.running ? 'spin' : ''} size={18} aria-hidden="true" />
      </button>

      {lastSync ? <span className="last-sync">Atualizado {lastSync}</span> : null}
    </section>
  );
}
