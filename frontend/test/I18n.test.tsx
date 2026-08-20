import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { I18nProvider, LanguageSwitch } from "../components/I18n";

describe("I18n", () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it("switches languages, updates document metadata, and persists the choice", () => {
    render(
      <I18nProvider>
        <LanguageSwitch />
      </I18nProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Español" }));

    expect(screen.getByText("Idioma")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Español" })).toHaveAttribute("aria-pressed", "true");
    expect(document.documentElement.lang).toBe("es");
    expect(localStorage.getItem("aws-printer-locale")).toBe("es");
  });

  it("falls back to English for an invalid stored locale", async () => {
    localStorage.setItem("aws-printer-locale", "fr");

    render(
      <I18nProvider>
        <LanguageSwitch />
      </I18nProvider>,
    );

    expect(screen.getByText("Language")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "English" })).toHaveAttribute("aria-pressed", "true");
  });
});
