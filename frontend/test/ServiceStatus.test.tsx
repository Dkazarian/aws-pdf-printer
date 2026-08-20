import React from "react";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ServiceStatus } from "../components/ServiceStatus";

describe("ServiceStatus", () => {
  it("uses the online color when the service is online", () => {
    const { container } = render(<ServiceStatus state="ONLINE" error={null} />);

    expect(container.querySelector(".service-dot")).toHaveClass("online");
  });

  it("uses the offline color when the service is unavailable", () => {
    const { container } = render(
      <ServiceStatus state="OFFLINE" error="Unavailable" />,
    );

    expect(container.querySelector(".service-dot")).toHaveClass("offline");
  });
});

