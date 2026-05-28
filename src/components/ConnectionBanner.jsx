import { CloudOff, DatabaseZap, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { isSupabaseConfigured } from '../services/supabaseClient';
import { formatShortTime } from '../utils/date';

export function ConnectionBanner({ isOnline, syncState, onSync }) {
  const lastSync = formatShortTime(syncState.lastSyncedAt);
  const ConnectionIcon = isOnline ? Wifi : WifiOff;

  return (
    <section className="connection-bar" aria-label="Estado da aplicacao">
      <div className={isOnline ? 'connection-pill online' : 'connection-pill offline'}>
        <ConnectionIcon size={16} aria-hidden="true" />
        <span>{isOnline ? 'Com internet' : 'Sem internet'}</span>
      </div>

      <div className={isSupabaseConfigured ? 'connection-pill database-ok' : 'connection-pill database-missing'}>
        {isSupabaseConfigured ? (
          <DatabaseZap size={16} aria-hidden="true" />
        ) : (
          <CloudOff size={16} aria-hidden="true" />
        )}
        <span>{isSupabaseConfigured ? 'Nuvem pronta' : 'Configurar nuvem'}</span>
      </div>

      <button
        type="button"
        className="icon-button sync-button"
        onClick={onSync}
        disabled={!isOnline || syncState.running}
        title="Sincronizar agora"
        aria-label="Sincronizar agora"
      >
        <RefreshCw className={syncState.running ? 'spin-icon' : undefined} size={17} aria-hidden="true" />
        <span>{syncState.running ? 'Sincronizando' : 'Sincronizar'}</span>
      </button>

      {lastSync ? <span className="last-sync">Atualizado {lastSync}</span> : null}
    </section>
  );
}
