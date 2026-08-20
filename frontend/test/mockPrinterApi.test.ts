import { describe, expect, it } from "vitest";
import { getMockJobStatus, submitMockJob } from "./fixtures/mockPrinterApi";

describe("mock printer API", () => {
  it("moves a job from processing to completed", async () => {
    const job = await submitMockJob("Hello AWS");

    expect(job.status).toBe("PENDING");
    await expect(getMockJobStatus(job.jobId)).resolves.toMatchObject({
      status: "PROCESSING",
    });
    await expect(getMockJobStatus(job.jobId)).resolves.toMatchObject({
      status: "COMPLETED",
    });
  });

  it("returns a failed result for the failure test token", async () => {
    const job = await submitMockJob("[fail]");

    await getMockJobStatus(job.jobId);
    await expect(getMockJobStatus(job.jobId)).resolves.toMatchObject({
      status: "FAILED",
    });
  });
});
