import { WeeklyEmailLog } from "@/types";

export const weeklyEmailLog: WeeklyEmailLog[] = [
  {
    id: "e-5001",
    buyer: "Nordic Roasters",
    fileName: "weekly-shipments-2024-05-03.csv",
    date: "2024-05-03 08:00",
    status: "Sent",
    retryCount: 0,
  },
  {
    id: "e-5002",
    buyer: "Blue River Coffee",
    fileName: "weekly-shipments-2024-05-03.csv",
    date: "2024-05-03 08:05",
    status: "Sent",
    retryCount: 0,
  },
  {
    id: "e-5003",
    buyer: "Atlas Trading",
    fileName: "weekly-shipments-2024-05-03.csv",
    date: "2024-05-03 08:07",
    status: "Failed",
    retryCount: 1,
  },
  {
    id: "e-5004",
    buyer: "Nordic Roasters",
    fileName: "weekly-shipments-2024-05-10.csv",
    date: "2024-05-10 08:00",
    status: "Sent",
    retryCount: 0,
  },
  {
    id: "e-5005",
    buyer: "Blue River Coffee",
    fileName: "weekly-shipments-2024-05-10.csv",
    date: "2024-05-10 08:05",
    status: "Queued",
    retryCount: 0,
  }
];
