"use client";
import { useCallback, useEffect, useState } from "react";
import { api, ApiError } from "./api";

/** Minimal data-fetching hook with refetch, loading, and error states. */
export function useApi<T>(path: string | null) {
  const [data, setData] = useState<T | undefined>(undefined);
  const [error, setError] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(Boolean(path));

  const refetch = useCallback(async () => {
    if (!path) return;
    setLoading(true);
    setError(undefined);
    try {
      setData(await api<T>(path));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [path]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { data, error, loading, refetch };
}
