const metrics = [
  {
    key: 'total',
    label: 'Total',
    className: 'metric-total'
  },
  {
    key: 'synced',
    label: 'Sincronizados',
    className: 'metric-synced'
  },
  {
    key: 'pending',
    label: 'Pendentes',
    className: 'metric-pending'
  },
  {
    key: 'failed',
    label: 'Falhas',
    className: 'metric-failed'
  }
];

export function Dashboard({ dashboard }) {
  return (
    <section className="dashboard" aria-label="Indicadores operacionais">
      {metrics.map(({ key, label, className }) => (
        <article className={`metric-card ${className}`} key={key}>
          <div>
            <strong>{dashboard[key] ?? 0}</strong>
            <span>{label}</span>
          </div>
        </article>
      ))}
    </section>
  );
}
