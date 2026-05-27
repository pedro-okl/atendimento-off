import {
  listQueuedAttendances,
  markFailed,
  markSynced,
  markSyncing,
  resetStaleSyncing,
  upsertRemoteAttendances
} from '../db/attendanceRepository';
import { SYNC_STATUS } from '../db/database';
import { isSupabaseConfigured, supabase } from './supabaseClient';

let syncInProgress = false;
const REMOTE_COLUMNS = 'client_id,nome_atendido,descricao,atendimento_em,created_at,updated_at';
const REMOTE_PAGE_SIZE = 1000;

function toRemotePayload(record) {
  return {
    client_id: record.clientId,
    nome_atendido: record.nomeAtendido,
    descricao: record.descricao,
    atendimento_em: record.atendimentoEm,
    created_at: record.createdAt,
    updated_at: new Date().toISOString()
  };
}

function readableError(error) {
  if (!error) {
    return 'Falha desconhecida na sincronizacao.';
  }

  if (typeof error === 'string') {
    return error;
  }

  return error.message || error.details || 'Falha desconhecida na sincronizacao.';
}

function toLocalRecord(row) {
  return {
    clientId: row.client_id,
    nomeAtendido: row.nome_atendido,
    descricao: row.descricao,
    atendimentoEm: row.atendimento_em,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    syncStatus: SYNC_STATUS.SYNCED,
    retryCount: 0,
    lastSyncAttempt: null,
    lastError: null
  };
}

async function pullRemoteAttendances() {
  let imported = 0;
  let page = 0;

  while (true) {
    const from = page * REMOTE_PAGE_SIZE;
    const to = from + REMOTE_PAGE_SIZE - 1;

    const { data, error } = await supabase
      .from('atendimentos')
      .select(REMOTE_COLUMNS)
      .order('atendimento_em', { ascending: false })
      .range(from, to);

    if (error) {
      throw error;
    }

    const records = (data || []).map(toLocalRecord);
    imported += await upsertRemoteAttendances(records);

    if (records.length < REMOTE_PAGE_SIZE) {
      return imported;
    }

    page += 1;
  }
}

export async function syncPendingAttendances() {
  if (syncInProgress) {
    return { synced: 0, failed: 0, pulled: 0, skipped: true, reason: 'Sincronizacao em andamento.' };
  }

  if (!navigator.onLine) {
    return { synced: 0, failed: 0, pulled: 0, skipped: true, reason: 'Dispositivo offline.' };
  }

  syncInProgress = true;
  let synced = 0;
  let failed = 0;

  try {
    await resetStaleSyncing();
    const queue = await listQueuedAttendances();

    if (!isSupabaseConfigured) {
      await Promise.all(
        queue.map((record) => markFailed(record.clientId, 'Supabase nao configurado no arquivo .env.'))
      );

      return {
        synced: 0,
        failed: queue.length,
        pulled: 0,
        skipped: false,
        reason: 'Supabase nao configurado.'
      };
    }

    for (const record of queue) {
      try {
        await markSyncing(record.clientId);

        const { error } = await supabase
          .from('atendimentos')
          .upsert(toRemotePayload(record), { onConflict: 'client_id' });

        if (error) {
          throw error;
        }

        await markSynced(record.clientId);
        synced += 1;
      } catch (error) {
        await markFailed(record.clientId, readableError(error));
        failed += 1;
      }
    }

    const pulled = await pullRemoteAttendances();

    return { synced, failed, pulled, skipped: false, reason: null };
  } finally {
    syncInProgress = false;
  }
}

export function subscribeToRemoteAttendances() {
  if (!isSupabaseConfigured) {
    return null;
  }

  const channel = supabase
    .channel('public:atendimentos')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'atendimentos' },
      async (payload) => {
        if (payload.eventType === 'DELETE' || !payload.new) {
          return;
        }

        try {
          await upsertRemoteAttendances([toLocalRecord(payload.new)]);
        } catch (error) {
          console.warn('Registro remoto nao importado:', error);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
