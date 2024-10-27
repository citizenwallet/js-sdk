export interface Log {
  hash: string;
  tx_hash: string;
  created_at: string; // ISO 8601 date string
  updated_at: string; // ISO 8601 date string
  nonce: number;
  sender: string;
  to: string;
  value: string; // BigInt as string
  data: any | null; // Assuming this could be any JSON object or null
  extra_data: any | null; // Assuming this could be any JSON object or null
  status: LogStatus;
}

// Enum for LogStatus
export enum LogStatus {
  Unknown = "",
  Sending = "sending",
  Pending = "pending",
  Success = "success",
  Fail = "fail",
}
