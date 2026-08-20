import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useServiceStatus } from "../hooks/useServiceStatus";
import { getServiceStatus } from "../lib/printerApi";

vi.mock("../lib/printerApi", () => ({
  getServiceStatus: vi.fn(),
}));

const mockedGetServiceStatus = vi.mocked(getServiceStatus);

describe("useServiceStatus", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("loads the service status once", async () => {
    mockedGetServiceStatus.mockResolvedValue({ message: "ONLINE" });
    const { result } = renderHook(() => useServiceStatus());

    expect(result.current.state).toBe("CHECKING");

    await act(async () => {
      vi.advanceTimersByTime(150);
      await Promise.resolve();
    });

    expect(result.current.state).toBe("ONLINE");
    expect(mockedGetServiceStatus).toHaveBeenCalledOnce();
  });

  it("exposes a friendly error when the status request fails", async () => {
    mockedGetServiceStatus.mockRejectedValue(new Error("Service unavailable"));
    const { result } = renderHook(() => useServiceStatus());

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.state).toBe("OFFLINE");
    expect(result.current.error).toBe("Service unavailable");
  });
});
