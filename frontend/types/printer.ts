export const jobStates = ["NONE", "SENDING", "PENDING", "PROCESSING", "COMPLETED"] as const;

export type JobState = (typeof jobStates)[number];
export type ActiveJobState = Exclude<JobState, "NONE" | "SENDING">;
export type ServiceState = "CHECKING" | "ONLINE" | "OFFLINE";

export type ServiceStatusResponse = {
  message: "ONLINE";
};

export type PrintJobResponse = {
  jobId: string;
  status: "PENDING";
};

export type JobStatusResponse = {
  jobId: string;
  status: ActiveJobState | "FAILED";
  error?: string;
};

export type PrinterError = {
  message: string;
  code?: string;
};


