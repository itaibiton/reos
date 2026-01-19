// Shared deal stage info for display across components
export const DEAL_STAGES = {
  interest: { label: "Interest", color: "bg-blue-100 text-blue-800" },
  broker_assigned: { label: "With Broker", color: "bg-purple-100 text-purple-800" },
  mortgage: { label: "Mortgage", color: "bg-orange-100 text-orange-800" },
  legal: { label: "Legal", color: "bg-indigo-100 text-indigo-800" },
  closing: { label: "Closing", color: "bg-yellow-100 text-yellow-800" },
  completed: { label: "Completed", color: "bg-green-100 text-green-800" },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-800" },
} as const;

export type DealStage = keyof typeof DEAL_STAGES;
