import React from "react";

type DownloadButtonProps = {
  disabled?: boolean;
  onClick?: () => void;
};

export function DownloadButton({ disabled = true, onClick }: DownloadButtonProps) {
  return (
    <button className="download-button" type="button" disabled={disabled} onClick={onClick}>
      Download PDF
    </button>
  );
}
