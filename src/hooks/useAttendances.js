import { liveQuery } from 'dexie';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { SYNC_STATUS } from '../db/database';
import { createAttendance, listAttendances } from '../db/attendanceRepository';
import { syncPendingAttendances } from '../services/syncService';
import { useOnlineStatus } from './useOnlineStatus';

const initialSyncState = {
  running: false,
  lastResult: null,
  lastSyncedAt: null,
  error: null
};

export function useAttendances() {
  const isOnline = useOnlineStatus();
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncState, setSyncState] = useState(initialSyncState);

  useEffect(() => {
    const subscription = liveQuery(() => listAttendances()).subscribe({
      next: (records) => {
        setAttendances(records);
        setLoading(false);
      },
      error: (error) => {
        setSyncState((current) => ({ ...current, error: error.message }));
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const dashboard = useMemo(() => {
    return attendances.reduce(
      (acc, record) => {
        acc.total += 1;
        acc[record.syncStatus] = (acc[record.syncStatus] || 0) + 1;
        return acc;
      },
      {
        total: 0,
        [SYNC_STATUS.SYNCED]: 0,
        [SYNC_STATUS.PENDING]: 0,
        [SYNC_STATUS.FAILED]: 0,
        [SYNC_STATUS.SYNCING]: 0
      }
    );
  }, [attendances]);

  const syncNow = useCallback(async () => {
    setSyncState((current) => ({ ...current, running: true, error: null }));

    try {
      const result = await syncPendingAttendances();
      setSyncState((current) => ({
        running: false,
        lastResult: result,
        lastSyncedAt: result.skipped ? current.lastSyncedAt : new Date().toISOString(),
        error: result.reason || null
      }));
      return result;
    } catch (error) {
      setSyncState((current) => ({
        ...current,
        running: false,
        error: error.message || 'Erro ao sincronizar.'
      }));
      return null;
    }
  }, []);

  const addAttendance = useCallback(
    async (input) => {
      const record = await createAttendance(input);

      if (navigator.onLine) {
        window.setTimeout(syncNow, 250);
      }

      return record;
    },
    [syncNow]
  );

  useEffect(() => {
    if (!isOnline) {
      return undefined;
    }

    const timer = window.setTimeout(syncNow, 500);
    return () => window.clearTimeout(timer);
  }, [isOnline, syncNow]);

  return {
    attendances,
    dashboard,
    loading,
    isOnline,
    syncState,
    addAttendance,
    syncNow
  };
}
