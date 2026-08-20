"use client";

import React from "react";
import type { ServiceState } from "../types/printer";

type ServiceStatusProps = {
  state: ServiceState;
  error: string | null;
};

export function ServiceStatus({ state, error }: ServiceStatusProps) {
  const online = state === "ONLINE";

  return (
    <section className="service-status" aria-live="polite">
      <span className={`service-dot ${online ? "online" : "offline"}`} aria-hidden="true" />
      <div>
        <p className="service-label">Service status</p>
        <p className="service-value">{error ? "OFFLINE" : state}</p>
      </div>
    </section>
  );
}
