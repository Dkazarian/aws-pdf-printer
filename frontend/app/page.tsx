"use client";

import { useCallback, useEffect, useState } from "react";

type ServiceStatus = { message?: string };

export default function Home() {
  const [status, setStatus] = useState<ServiceStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkStatus = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/status", { cache: "no-store" });
      const body = (await response.json()) as ServiceStatus & { error?: string };

      if (!response.ok) {
        throw new Error(body.error ?? `Request failed with status ${response.status}`);
      }

      setStatus(body);
    } catch (requestError) {
      setStatus(null);
      setError(requestError instanceof Error ? requestError.message : "Unable to reach the service");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void checkStatus();
  }, [checkStatus]);

  const online = status?.message?.toUpperCase() === "ONLINE";

  return (
    <main className="shell">
      <section className="hero">
        <p className="eyebrow">AWS PDF PRINTER</p>
        <h1>Service status</h1>
        <p className="lede">A small React client connected to your API Gateway service through Vercel.</p>
      </section>

      <section className="status-card" aria-live="polite">
        <div className={`status-dot ${online ? "online" : "offline"}`} />
        <div>
          <p className="label">API Gateway</p>
          <h2>{loading ? "Checking…" : error ? "Unavailable" : status?.message ?? "Unknown"}</h2>
          {error && <p className="error">{error}</p>}
        </div>
        <button type="button" onClick={() => void checkStatus()} disabled={loading}>
          {loading ? "Checking" : "Refresh"}
        </button>
      </section>
    </main>
  );
}
