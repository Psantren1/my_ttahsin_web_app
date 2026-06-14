import { query } from '@/lib/db/client';

export interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}

export async function createAuditLog(data: {
  userId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  oldValues?: Record<string, unknown> | null;
  newValues?: Record<string, unknown> | null;
  ipAddress?: string | null;
}): Promise<void> {
  await query(
    `INSERT INTO audit_log (user_id, action, entity_type, entity_id, old_values, new_values, ip_address)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [
      data.userId ?? null,
      data.action,
      data.entityType,
      data.entityId ?? null,
      data.oldValues ? JSON.stringify(data.oldValues) : null,
      data.newValues ? JSON.stringify(data.newValues) : null,
      data.ipAddress ?? null,
    ]
  );
}

export async function getAuditLogs(options?: {
  entityType?: string;
  entityId?: string;
  userId?: string;
  limit?: number;
}): Promise<AuditLog[]> {
  const conditions: string[] = [];
  const params: unknown[] = [];
  let paramIndex = 1;

  if (options?.entityType) {
    conditions.push(`entity_type = $${paramIndex++}`);
    params.push(options.entityType);
  }
  if (options?.entityId) {
    conditions.push(`entity_id = $${paramIndex++}`);
    params.push(options.entityId);
  }
  if (options?.userId) {
    conditions.push(`user_id = $${paramIndex++}`);
    params.push(options.userId);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const limit = options?.limit ?? 50;

  const sql = `SELECT * FROM audit_log ${where} ORDER BY created_at DESC LIMIT $${paramIndex}`;
  params.push(limit);

  return query<AuditLog>(sql, params);
}
