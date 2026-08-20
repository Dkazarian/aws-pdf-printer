import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DownloadButton } from "../components/DownloadButton";

describe("DownloadButton", () => {
  it("is disabled by default", () => {
    render(<DownloadButton />);

    expect(screen.getByRole("button", { name: "Download PDF" })).toBeDisabled();
  });

  it("forwards clicks when enabled", () => {
    const onClick = vi.fn();
    render(<DownloadButton disabled={false} onClick={onClick} />);

    fireEvent.click(screen.getByRole("button", { name: "Download PDF" }));
    expect(onClick).toHaveBeenCalledOnce();
  });
});

