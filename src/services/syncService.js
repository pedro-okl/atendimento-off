import {
  listQueuedAttendances,
  markFailed,
  markSynced,
  markSyncing,
  resetStaleSyncing
} from '../db/attendanceRepository';
import { isSupabaseConfigured, supabase } from './supabaseClient';

let syncInProgress = false;

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

export async function syncPendingAttendances() {
  if (syncInProgress) {
    return { synced: 0, failed: 0, skipped: true, reason: 'Sincronizacao em andamento.' };
  }

  if (!navigator.onLine) {
    return { synced: 0, failed: 0, skipped: true, reason: 'Dispositivo offline.' };
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

    return { synced, failed, skipped: false, reason: null };
  } finally {
    syncInProgress = false;
  }
}
