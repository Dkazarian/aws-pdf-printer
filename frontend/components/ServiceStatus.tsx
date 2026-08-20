"use client";

import React from "react";
import type { ServiceState } from "../types/printer";
import { useI18n } from "./I18n";

type ServiceStatusProps = {
  state: ServiceState;
  error: string | null;
};

export function ServiceStatus({ state, error }: ServiceStatusProps) {
  const online = state === "ONLINE";
  const { t } = useI18n();
  const status = error ? t.offline : state === "ONLINE" ? t.online : state === "OFFLINE" ? t.offline : t.checking;

  return (
    <section className="service-status" aria-live="polite">
      <span className={`service-dot ${online ? "online" : "offline"}`} aria-hidden="true" />
      <div>
        <p className="service-label">{t.serviceStatus}</p>
        <p className="service-value">{status}</p>
      </div>
    </section>
  );
}
