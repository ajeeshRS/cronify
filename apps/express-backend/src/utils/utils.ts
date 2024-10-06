import cronParser from "cron-parser";
import axios from "axios";

export const getNextTwoExecutions = (cronSchedule: string) => {
  const now = new Date();

  const interval = cronParser.parseExpression(cronSchedule, {
    currentDate: now,
  });

  const nextTime = [];

  for (let i = 0; i < 2; i++) {
    nextTime.push(interval.next().toDate());
  }

  return nextTime;
};

export const getCronExpression = (scehdule: string) => {
  return `*/${scehdule} * * * *`;
};

export const execute = async (url: string) => {
  try {
    const response = await axios.head(url, {
      timeout: 5000,
    });
    return response;
  } catch (err) {
    console.error("Error hitting the url: ", err);
  }
};
