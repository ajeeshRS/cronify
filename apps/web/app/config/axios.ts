import axios from "axios";

export const API = axios.create({
  baseURL: "http://localhost:3001/api/v1/cronjob",
});
