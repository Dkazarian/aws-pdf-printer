import type { JobStatusResponse, PrintJobResponse, ServiceStatusResponse } from "../types/printer";

type MockJob = {
  shouldFail: boolean;
  polls: number;
};

const jobs = new Map<string, MockJob>();

const wait = (milliseconds: number) =>
  new Promise((resolve) => window.setTimeout(resolve, milliseconds));

export async function getMockServiceStatus(): Promise<ServiceStatusResponse> {
  await wait(150);
  return { message: "ONLINE" };
}

export async function submitMockJob(text: string): Promise<PrintJobResponse> {
  await wait(1000);

  if (!text.trim()) {
    throw new Error("Enter some text before submitting.");
  }

  const jobId = crypto.randomUUID();
  jobs.set(jobId, { shouldFail: text.toLowerCase().includes("[fail]"), polls: 0 });

  return { jobId, status: "PENDING" };
}

export async function getMockJobStatus(jobId: string): Promise<JobStatusResponse> {
  await wait(75);

  const job = jobs.get(jobId);
  if (!job) {
    throw new Error("This print job is no longer available.");
  }

  job.polls += 1;

  if (job.shouldFail && job.polls >= 2) {
    return {
      jobId,
      status: "FAILED",
      error: "The demo worker could not create this PDF.",
    };
  }

  if (job.polls === 1) return { jobId, status: "PROCESSING" };
  return { jobId, status: "COMPLETED" };
}
