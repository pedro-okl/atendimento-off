import { AlertTriangle, CheckCircle2, Clock3, Layers3 } from 'lucide-react';

const metrics = [
  {
    key: 'total',
    label: 'Total',
    className: 'metric-total',
    helper: 'no caderno',
    Icon: Layers3
  },
  {
    key: 'synced',
    label: 'Sincronizados',
    className: 'metric-synced',
    helper: 'na nuvem',
    Icon: CheckCircle2
  },
  {
    key: 'pending',
    label: 'Pendentes',
    className: 'metric-pending',
    helper: 'aguardando rede',
    Icon: Clock3
  },
  {
    key: 'failed',
    label: 'Falhas',
    className: 'metric-failed',
    helper: 'precisam olhar',
    Icon: AlertTriangle
  }
];

export function Dashboard({ dashboard }) {
  return (
    <section className="dashboard" aria-label="Indicadores operacionais">
      {metrics.map(({ key, label, className, helper, Icon }) => (
        <article className={`metric-card ${className}`} key={key}>
          <Icon className="metric-icon" size={18} aria-hidden="true" />
          <div>
            <strong>{dashboard[key] ?? 0}</strong>
            <span>{label}</span>
            <small>{helper}</small>
          </div>
        </article>
      ))}
    </section>
  );
}
