"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import React from "react";

export type Locale = "en" | "es";

const translations = {
  en: {
    language: "Language",
    english: "English",
    spanish: "Español",
    title: "Print plain text to PDF.",
    lede: "A serverless text-to-PDF converter powered by AWS.",
    serviceStatus: "Service status",
    checking: "CHECKING",
    online: "ONLINE",
    offline: "OFFLINE",
    textToPrint: "Text to print",
    placeholder: "Type something to turn into a PDF...",
    characters: "characters",
    submitText: "Submit text",
    submitting: "Submitting...",
    jobProgress: "Job progress",
    progressLabel: "Print job progress",
    sending: "SENDING",
    pending: "PENDING",
    processing: "PROCESSING",
    completed: "COMPLETED",
    behindScenes: "What happens behind the scenes",
    workflowLabel: "AWS processing workflow",
    workflow: [
      "API Gateway",
      "Lambda creates a job in DynamoDB",
      "Lambda detects the DynamoDB INSERT and sends the job to SQS",
      "Worker Lambda generates the PDF",
      "PDF is stored in S3",
    ],
    download: "Download PDF",
    viewSource: "View source on GitHub",
    errors: {
      enterText: "Enter some text before submitting.",
      submit: "Unable to submit the print job.",
      status: "Unable to read the print job.",
      failed: "The print job failed.",
      download: "The PDF could not be downloaded.",
    },
  },
  es: {
    language: "Idioma",
    english: "English",
    spanish: "Español",
    title: "Imprime texto plano en PDF.",
    lede: "Un conversor serverless de texto a PDF impulsado por AWS.",
    serviceStatus: "Estado del servicio",
    checking: "COMPROBANDO",
    online: "EN LÍNEA",
    offline: "FUERA DE LÍNEA",
    textToPrint: "Texto para imprimir",
    placeholder: "Escribe algo para convertirlo en PDF...",
    characters: "caracteres",
    submitText: "Enviar texto",
    submitting: "Enviando...",
    jobProgress: "Progreso del trabajo",
    progressLabel: "Progreso del trabajo de impresión",
    sending: "ENVIANDO",
    pending: "EN COLA",
    processing: "PROCESANDO",
    completed: "COMPLETADO",
    behindScenes: "Qué ocurre detrás de escena",
    workflowLabel: "Flujo de procesamiento de AWS",
    workflow: [
      "API Gateway",
      "Lambda crea un trabajo en DynamoDB",
      "Lambda detecta la inserción en DynamoDB y envía el trabajo a SQS",
      "Lambda worker genera el PDF",
      "El PDF se guarda en S3",
    ],
    download: "Descargar PDF",
    viewSource: "Ver código fuente en GitHub",
    errors: {
      enterText: "Escribe algún texto antes de enviar.",
      submit: "No se pudo enviar el trabajo de impresión.",
      status: "No se pudo leer el trabajo de impresión.",
      failed: "El trabajo de impresión falló.",
      download: "No se pudo descargar el PDF.",
    },
  },
} as const;

type Translation = (typeof translations)[Locale];
type I18nValue = { locale: Locale; setLocale: (locale: Locale) => void; t: Translation };

const defaultValue: I18nValue = {
  locale: "en",
  setLocale: () => undefined,
  t: translations.en,
};

const I18nContext = createContext<I18nValue>(defaultValue);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>("en");

  useEffect(() => {
    const stored = window.localStorage.getItem("aws-printer-locale");
    if (stored === "en" || stored === "es") setLocale(stored);
  }, []);

  useEffect(() => {
    window.localStorage.setItem("aws-printer-locale", locale);
    document.documentElement.lang = locale;
  }, [locale]);

  const value = useMemo(() => ({ locale, setLocale, t: translations[locale] }), [locale]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}

export function LanguageSwitch() {
  const { locale, setLocale, t } = useI18n();

  return (
    <div className="language-switch" aria-label={t.language} role="group">
      <span>{t.language}</span>
      <button className={locale === "en" ? "selected" : ""} type="button" aria-pressed={locale === "en"} onClick={() => setLocale("en")}>
        {t.english}
      </button>
      <button className={locale === "es" ? "selected" : ""} type="button" aria-pressed={locale === "es"} onClick={() => setLocale("es")}>
        {t.spanish}
      </button>
    </div>
  );
}

export function translateError(message: string | null, t: Translation) {
  if (!message) return message;
  const knownMessages = [
    ["Enter some text before submitting.", t.errors.enterText],
    ["Unable to submit the print job.", t.errors.submit],
    ["Unable to read the print job.", t.errors.status],
    ["The print job failed.", t.errors.failed],
    ["The PDF could not be downloaded.", t.errors.download],
  ];
  return knownMessages.find(([source]) => source === message)?.[1] ?? message;
}
