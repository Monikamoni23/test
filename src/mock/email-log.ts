import type { WeeklyEmailLog } from "@/types";

export const weeklyEmailLog: WeeklyEmailLog[] = [
  {
    id: "log-001",
    buyer: "Nordic Roasters",
    fileName: "weekly-shipments-2024-05-01.csv",
    date: "2024-05-01 08:15",
    status: "Sent",
    retryCount: 0,
  },
  {
    id: "log-002",
    buyer: "Atlas Trading",
    fileName: "weekly-shipments-2024-05-08.csv",
    date: "2024-05-08 08:05",
    status: "Sent",
    retryCount: 0,
  },
  {
    id: "log-003",
    buyer: "Blue River Coffee",
    fileName: "weekly-shipments-2024-05-15.csv",
    date: "2024-05-15 08:10",
    status: "Failed",
    retryCount: 1,
  },
];
