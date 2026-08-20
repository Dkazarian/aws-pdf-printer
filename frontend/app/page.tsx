"use client";

import { PrinterDashboard } from "../components/PrinterDashboard";
import { I18nProvider } from "../components/I18n";

export default function Home() {
  return (
    <I18nProvider>
      <PrinterDashboard />
    </I18nProvider>
  );
}
