import React from "react";
import { useI18n } from "./I18n";

type PrintJobFormProps = {
  text: string;
  submitting: boolean;
  disabled?: boolean;
  onTextChange: (text: string) => void;
  onSubmit: () => void;
};

export function PrintJobForm({
  text,
  submitting,
  onTextChange,
  onSubmit,
  disabled = submitting,
}: PrintJobFormProps) {
  const { t } = useI18n();

  return (
    <form
      className="print-form"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <label htmlFor="print-text">{t.textToPrint}</label>
      <textarea
        id="print-text"
        maxLength={500}
        onChange={(event) => onTextChange(event.target.value)}
        placeholder={t.placeholder}
        value={text}
      />
      <div className="form-actions">
        <span className="character-count">{text.length.toLocaleString()} / 500 {t.characters}</span>
        <button
          className="primary-button"
          disabled={disabled || !text.trim() || text.length > 500}
          type="submit"
        >
          {submitting ? t.submitting : t.submitText}
        </button>
      </div>
    </form>
  );
}
