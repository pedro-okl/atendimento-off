import { AlertTriangle, CheckCircle2, Clock3, LoaderCircle } from 'lucide-react';
import { SYNC_STATUS } from '../db/database';

const statusConfig = {
  [SYNC_STATUS.PENDING]: {
    label: 'Pendente',
    className: 'status status-pending',
    Icon: Clock3
  },
  [SYNC_STATUS.SYNCING]: {
    label: 'Sincronizando',
    className: 'status status-syncing',
    Icon: LoaderCircle
  },
  [SYNC_STATUS.SYNCED]: {
    label: 'Sincronizado',
    className: 'status status-synced',
    Icon: CheckCircle2
  },
  [SYNC_STATUS.FAILED]: {
    label: 'Falhou',
    className: 'status status-failed',
    Icon: AlertTriangle
  }
};

export function StatusBadge({ status }) {
  const config = statusConfig[status] || statusConfig[SYNC_STATUS.PENDING];
  const { Icon } = config;

  return (
    <span className={config.className}>
      <Icon size={14} aria-hidden="true" />
      {config.label}
    </span>
  );
}
