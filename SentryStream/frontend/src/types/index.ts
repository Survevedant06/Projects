// Shared TypeScript interfaces — mirrors the Python Pydantic schemas

export type CheckStatus = "pass" | "warn" | "fail" | "error";

export interface CheckResult {
  check_name: string;
  status: CheckStatus;
  detail: string;
  metadata: Record<string, unknown>;
}

export interface ScanEvent {
  event: "scan_started" | "scan_completed";
  scan_id: string;
  target: string;
  aggregate_status?: CheckStatus;
  duration_ms?: number;
  started_at?: string;
  finished_at?: string;
  checks?: CheckResult[];
}

export interface Target {
  id: string;
  url: string;
  label?: string;
  created_at: string;
  last_scanned_at?: string;
  last_status?: CheckStatus;
}
