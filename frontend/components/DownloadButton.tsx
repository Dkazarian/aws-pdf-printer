import React from "react";
import { useI18n } from "./I18n";

type DownloadButtonProps = {
  disabled?: boolean;
  onClick?: () => void;
};

export function DownloadButton({ disabled = true, onClick }: DownloadButtonProps) {
  const { t } = useI18n();

  return (
    <button className="download-button" type="button" disabled={disabled} onClick={onClick}>
      {t.download}
    </button>
  );
}
