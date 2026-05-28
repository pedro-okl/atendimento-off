import { db, SYNC_STATUS } from './database';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function createClientId() {
  if (crypto?.randomUUID) {
    return crypto.randomUUID();
  }

  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = [...bytes].map((byte) => byte.toString(16).padStart(2, '0'));
  return [
    hex.slice(0, 4).join(''),
    hex.slice(4, 6).join(''),
    hex.slice(6, 8).join(''),
    hex.slice(8, 10).join(''),
    hex.slice(10, 16).join('')
  ].join('-');
}

export async function createAttendance(input) {
  const now = new Date().toISOString();
  const atendimentoEm = input.atendimentoEm || now;

  const record = {
    clientId: createClientId(),
    nomeAtendido: input.nomeAtendido.trim(),
    idade: input.idade,
    tipoProblema: input.tipoProblema.trim(),
    cpf: input.cpf,
    contato: input.contato.trim(),
    descricao: input.descricao.trim(),
    atendimentoEm,
    createdAt: now,
    updatedAt: now,
    syncStatus: SYNC_STATUS.PENDING,
    retryCount: 0,
    lastSyncAttempt: null,
    lastError: null
  };

  await db.attendances.put(record);
  return record;
}

export async function listAttendances() {
  const records = await db.attendances.toArray();
  return records.sort((a, b) => new Date(b.atendimentoEm) - new Date(a.atendimentoEm));
}

export async function upsertRemoteAttendances(records) {
  if (records.length === 0) {
    return 0;
  }

  await db.transaction('rw', db.attendances, async () => {
    for (const record of records) {
      const current = await db.attendances.get(record.clientId);

      await db.attendances.put({
        ...current,
        ...record,
        syncStatus: SYNC_STATUS.SYNCED,
        retryCount: 0,
        lastSyncAttempt: current?.lastSyncAttempt || null,
        lastError: null
      });
    }
  });

  return records.length;
}

export async function listQueuedAttendances() {
  await repairInvalidClientIds();

  const records = await db.attendances
    .where('syncStatus')
    .anyOf([SYNC_STATUS.PENDING, SYNC_STATUS.FAILED])
    .toArray();

  return records.sort((a, b) => {
    if (a.retryCount !== b.retryCount) {
      return a.retryCount - b.retryCount;
    }

    return new Date(a.createdAt) - new Date(b.createdAt);
  });
}

export async function markSyncing(clientId) {
  const now = new Date().toISOString();
  await db.attendances.update(clientId, {
    syncStatus: SYNC_STATUS.SYNCING,
    lastSyncAttempt: now,
    lastError: null,
    updatedAt: now
  });
}

export async function markSynced(clientId) {
  const now = new Date().toISOString();
  await db.attendances.update(clientId, {
    syncStatus: SYNC_STATUS.SYNCED,
    lastError: null,
    updatedAt: now
  });
}

export async function markFailed(clientId, errorMessage) {
  const current = await db.attendances.get(clientId);
  const now = new Date().toISOString();

  await db.attendances.update(clientId, {
    syncStatus: SYNC_STATUS.FAILED,
    retryCount: (current?.retryCount || 0) + 1,
    lastSyncAttempt: now,
    lastError: errorMessage || 'Falha desconhecida na sincronizacao.',
    updatedAt: now
  });
}

export async function resetStaleSyncing() {
  const staleBefore = Date.now() - 2 * 60 * 1000;

  await db.attendances
    .where('syncStatus')
    .equals(SYNC_STATUS.SYNCING)
    .filter((record) => {
      if (!record.lastSyncAttempt) {
        return true;
      }

      return new Date(record.lastSyncAttempt).getTime() < staleBefore;
    })
    .modify((record) => {
      record.syncStatus = SYNC_STATUS.FAILED;
      record.lastError = 'Sincronizacao interrompida antes de concluir.';
      record.updatedAt = new Date().toISOString();
    });
}

export async function repairInvalidClientIds() {
  const records = await db.attendances.toArray();
  const invalidRecords = records.filter((record) => !UUID_PATTERN.test(record.clientId));

  if (invalidRecords.length === 0) {
    return 0;
  }

  await db.transaction('rw', db.attendances, async () => {
    for (const record of invalidRecords) {
      const oldClientId = record.clientId;
      const repairedRecord = {
        ...record,
        clientId: createClientId(),
        syncStatus: SYNC_STATUS.PENDING,
        lastError: null,
        updatedAt: new Date().toISOString()
      };

      await db.attendances.delete(oldClientId);
      await db.attendances.put(repairedRecord);
    }
  });

  return invalidRecords.length;
}
