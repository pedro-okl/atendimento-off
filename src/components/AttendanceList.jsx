import { ClipboardList, RotateCcw } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { formatDateTime } from '../utils/date';

export function AttendanceList({ attendances, loading, onSync, syncRunning }) {
  return (
    <section className="list-section" aria-labelledby="list-title">
      <div className="section-header">
        <div className="section-title">
          <ClipboardList size={20} aria-hidden="true" />
          <h2 id="list-title">Registros</h2>
        </div>

        <button
          type="button"
          className="secondary-button"
          onClick={onSync}
          disabled={syncRunning}
          title="Retentar fila"
          aria-label="Retentar fila"
        >
          <RotateCcw size={17} aria-hidden="true" />
          Retentar
        </button>
      </div>

      {loading ? <p className="empty-state">Carregando registros locais.</p> : null}

      {!loading && attendances.length === 0 ? (
        <p className="empty-state">Nenhum atendimento registrado.</p>
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
              <span>ID local: {attendance.clientId.slice(0, 8)}</span>
              <span>Tentativas: {attendance.retryCount || 0}</span>
            </footer>

            {attendance.lastError ? <div className="record-error">{attendance.lastError}</div> : null}
          </article>
        ))}
      </div>
    </section>
  );
}
