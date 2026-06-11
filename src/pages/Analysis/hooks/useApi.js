import { useState, useEffect, useCallback } from "react";

export default function useApi(url, ms = 0) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ts, setTs] = useState(null);

  const load = useCallback(async () => {
    try {
      const r = await fetch(url);
      if (!r.ok) throw new Error(r.status);

      setData(await r.json());
      setTs(new Date());
    } catch (_) {
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    load();

    if (ms > 0) {
      const id = setInterval(load, ms);
      return () => clearInterval(id);
    }
  }, [load, ms]);

  return { data, loading, ts, refresh: load };
}