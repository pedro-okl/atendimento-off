import { AlertOctagon, CheckCircle2, Clock3, Database } from 'lucide-react';

const metrics = [
  {
    key: 'total',
    label: 'Total',
    Icon: Database,
    className: 'metric-total'
  },
  {
    key: 'synced',
    label: 'Sincronizados',
    Icon: CheckCircle2,
    className: 'metric-synced'
  },
  {
    key: 'pending',
    label: 'Pendentes',
    Icon: Clock3,
    className: 'metric-pending'
  },
  {
    key: 'failed',
    label: 'Falhas',
    Icon: AlertOctagon,
    className: 'metric-failed'
  }
];

export function Dashboard({ dashboard }) {
  return (
    <section className="dashboard" aria-label="Indicadores operacionais">
      {metrics.map(({ key, label, Icon, className }) => (
        <article className={`metric-card ${className}`} key={key}>
          <div className="metric-icon">
            <Icon size={18} aria-hidden="true" />
          </div>
          <div>
            <strong>{dashboard[key] ?? 0}</strong>
            <span>{label}</span>
          </div>
        </article>
      ))}
    </section>
  );
}
