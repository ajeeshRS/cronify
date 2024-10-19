export interface CronJobStatus {
  activeCount: number;
  inActiveCount: number;
  failedCount: number;
}

export type EventStateType = {
  cronJobUrl: string;
  id: string;
  createdAt: Date;
  time: Date;
  status: "PENDING" | "FAILURE" | "SUCCESS";
};

export interface CronJobState {
  id: string;
  createdAt: Date;
  title: string;
  url: string;
  cronSchedule: string;
  active: boolean;
  isFailed: boolean;
  userId: string;
}

export type NextExecutionType = {
  id: string;
  status: "PENDING" | "FAILURE" | "SUCCESS";
  createdAt: Date;
  cronJobId: string;
  time: Date;
};

export type PreviousEventType = {
  id: string;
  status: "PENDING" | "FAILURE" | "SUCCESS";
  createdAt: Date;
  cronJobId: string;
  time: Date;
};

export interface CronJobState {
  id: string;
  title: string;
  url: string;
  cronSchedule: string;
  active: boolean;
  previousEvents: PreviousEventType[];
  isFailed: boolean;
  userId: string;
  createdAt: Date;
  totalEvents: number;
}

export const initialCronJobState: CronJobState = {
  id: "",
  title: "",
  url: "",
  cronSchedule: "",
  active: false,
  previousEvents: [],
  isFailed: false,
  userId: "",
  createdAt: new Date(0),
  totalEvents: 0,
};

export interface CronJobOnly {
  id: string;
  title: string;
  url: string;
  cronSchedule: string;
  active: boolean;
  isFailed: boolean;
  userId: string;
  createdAt: Date;
}
