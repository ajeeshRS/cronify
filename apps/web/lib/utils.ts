import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import jwt from "jsonwebtoken";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const isSameDay = (date1: Date, date2: Date) => {
  if (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  ) {
    return true;
  } else {
    return false;
  }
};

export const formatDate = (date: Date) => {
  const dateStr = new Date(date).toDateString();
  const timeStr = new Date(date).toLocaleTimeString("en-US", {
    hour12: true,
  });
  return `${dateStr} - ${timeStr}`;
};

export const generateToken = (email: string) => {
  const secret = process.env.JWT_SECRET;
  const token = jwt.sign({ email }, secret as string, {
    expiresIn: "1h",
  });
  return token;
};

