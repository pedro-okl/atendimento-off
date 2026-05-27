import { RefreshCw, ScrollText } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { formatDateTime } from '../utils/date';

export function AttendanceList({ attendances, loading, onSync, syncRunning }) {
  return (
    <section className="list-section" aria-labelledby="list-title">
      <div className="section-header">
        <div className="section-title">
          <span className="section-glyph" aria-hidden="true">
            <ScrollText size={17} />
          </span>
          <h2 id="list-title">Registros</h2>
        </div>

        <button
          type="button"
          className="secondary-button"
          onClick={onSync}
          disabled={syncRunning}
          title="Atualizar registros"
          aria-label="Atualizar registros"
        >
          <RefreshCw className={syncRunning ? 'spin-icon' : undefined} size={16} aria-hidden="true" />
          <span>{syncRunning ? 'Sincronizando' : 'Atualizar'}</span>
        </button>
      </div>

      {loading ? <p className="empty-state">Abrindo o caderno local...</p> : null}

      {!loading && attendances.length === 0 ? (
        <p className="empty-state">Nenhum atendimento registrado ainda.</p>
      ) : null}

      <div className="attendance-list">
        {attendances.map((attendance) => (
          <article className="attendance-card" key={attendance.clientId}>
            <div className="attendance-card-header">
              <div>
                <h3>{attendance.nomeAtendido}</h3>
                <time dateTime={attendance.atendimentoEm}>{formatDateTime(attendance.atendimentoEm)}</time>
              </div>
              <StatusBadge status={attendance.syncStatus} />
            </div>

            <p>{attendance.descricao}</p>

            <footer>
              <span>Ficha local {attendance.clientId.slice(0, 8)}</span>
              <span>{attendance.retryCount || 0} tentativa(s) de envio</span>
            </footer>

            {attendance.lastError ? <div className="record-error">{attendance.lastError}</div> : null}
          </article>
        ))}
      </div>
    </section>
  );
}
