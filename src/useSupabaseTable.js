import { useState, useEffect, useCallback } from "react";
import { supabase } from "./supabaseClient";

export function useSupabaseTable(table, toDb, fromDb, userId) {
  const [items, setItems] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from(table)
      .select("*")
      .order("created_at", { ascending: true });
    if (err) {
      setError(err.message);
    } else {
      setItems(data.map(fromDb));
    }
    setLoading(false);
  }, [table, userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const insert = useCallback(async (record) => {
    setError(null);
    const payload = { ...toDb(record), user_id: userId };
    const { data, error: err } = await supabase.from(table).insert(payload).select().single();
    if (err) {
      setError(err.message);
      return false;
    }
    setItems((prev) => [...(prev || []), fromDb(data)]);
    return true;
  }, [table, toDb, fromDb, userId]);

  const update = useCallback(async (id, record) => {
    setError(null);
    const { data, error: err } = await supabase
      .from(table)
      .update(toDb(record))
      .eq("id", id)
      .select()
      .single();
    if (err) {
      setError(err.message);
      return false;
    }
    setItems((prev) => prev.map((r) => (r.id === id ? fromDb(data) : r)));
    return true;
  }, [table, toDb, fromDb]);

  const remove = useCallback(async (id) => {
    setError(null);
    const { error: err } = await supabase.from(table).delete().eq("id", id);
    if (err) {
      setError(err.message);
      return false;
    }
    setItems((prev) => prev.filter((r) => r.id !== id));
    return true;
  }, [table]);

  return { items, loading, error, insert, update, remove, refresh };
}
