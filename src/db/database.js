import Dexie from 'dexie';

export const SYNC_STATUS = {
  PENDING: 'pending',
  SYNCING: 'syncing',
  SYNCED: 'synced',
  FAILED: 'failed'
};

export const db = new Dexie('registro_offline_atendimentos');

db.version(1).stores({
  attendances: 'clientId, syncStatus, atendimentoEm, updatedAt, nomeAtendido'
});
