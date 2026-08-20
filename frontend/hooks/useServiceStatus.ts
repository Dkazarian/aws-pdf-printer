"use client";

import { useEffect, useState } from "react";
import { getServiceStatus } from "../lib/printerApi";
import type { ServiceState } from "../types/printer";

export function useServiceStatus() {
  const [state, setState] = useState<ServiceState>("CHECKING");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    void getServiceStatus()
      .then(() => {
        if (!cancelled) setState("ONLINE");
      })
      .catch((requestError: unknown) => {
        if (!cancelled) {
          setState("OFFLINE");
          setError(requestError instanceof Error ? requestError.message : "The service is unavailable.");
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { state, error };
}
