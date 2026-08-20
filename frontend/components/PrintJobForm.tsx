import React from "react";

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
  return (
    <form
      className="print-form"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <label htmlFor="print-text">Text to print</label>
      <textarea
        id="print-text"
        maxLength={500}
        onChange={(event) => onTextChange(event.target.value)}
        placeholder="Type something to turn into a PDF..."
        value={text}
      />
      <div className="form-actions">
        <span className="character-count">{text.length.toLocaleString()} / 500 characters</span>
        <button
          className="primary-button"
          disabled={disabled || !text.trim() || text.length > 500}
          type="submit"
        >
          {submitting ? "Submitting..." : "Submit job"}
        </button>
      </div>
    </form>
  );
}
