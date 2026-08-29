export interface AuditLog {
  id: number;
  timestamp: string;
  username: string;
  action_type: string;
  resource_query: string;
  tx_hash: string;
  status: string;
}
