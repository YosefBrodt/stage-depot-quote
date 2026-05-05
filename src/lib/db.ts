import { sql } from "@vercel/postgres";
import type { QuoteState } from "./pricing";

let schemaReady: Promise<void> | null = null;

async function ensureSchema(): Promise<void> {
  await sql`
    CREATE TABLE IF NOT EXISTS quotes (
      id TEXT PRIMARY KEY,
      data JSONB NOT NULL,
      client_name TEXT,
      client_address TEXT,
      total NUMERIC,
      status TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_quotes_updated ON quotes(updated_at DESC)`;
  await sql`
    CREATE TABLE IF NOT EXISTS counters (
      key TEXT PRIMARY KEY,
      value INTEGER NOT NULL DEFAULT 0
    )
  `;
}

function ready(): Promise<void> {
  if (!schemaReady) schemaReady = ensureSchema();
  return schemaReady;
}

export type QuoteRow = {
  id: string;
  data: QuoteState;
  client_name: string | null;
  client_address: string | null;
  total: number | null;
  status: string | null;
  updated_at: string;
};

export async function listQuotes(): Promise<QuoteRow[]> {
  await ready();
  const { rows } = await sql<QuoteRow>`
    SELECT id, data, client_name, client_address, total, status, updated_at::text
    FROM quotes
    ORDER BY updated_at DESC
    LIMIT 500
  `;
  return rows;
}

export async function getQuote(id: string): Promise<QuoteRow | null> {
  await ready();
  const { rows } = await sql<QuoteRow>`
    SELECT id, data, client_name, client_address, total, status, updated_at::text
    FROM quotes WHERE id = ${id}
  `;
  return rows[0] ?? null;
}

export async function upsertQuote(
  id: string,
  data: QuoteState,
  total: number
): Promise<void> {
  await ready();
  const json = JSON.stringify(data);
  await sql`
    INSERT INTO quotes (id, data, client_name, client_address, total, status, updated_at)
    VALUES (
      ${id},
      ${json}::jsonb,
      ${data.client.name || null},
      ${data.client.address || null},
      ${total},
      ${data.status},
      NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      data = EXCLUDED.data,
      client_name = EXCLUDED.client_name,
      client_address = EXCLUDED.client_address,
      total = EXCLUDED.total,
      status = EXCLUDED.status,
      updated_at = NOW()
  `;
}

export async function deleteQuote(id: string): Promise<void> {
  await ready();
  await sql`DELETE FROM quotes WHERE id = ${id}`;
}

export async function nextCounter(year: number): Promise<number> {
  await ready();
  const key = `quote_${year}`;
  const { rows } = await sql<{ value: number }>`
    INSERT INTO counters (key, value)
    VALUES (${key}, 1)
    ON CONFLICT (key) DO UPDATE SET value = counters.value + 1
    RETURNING value
  `;
  return rows[0]?.value ?? 1;
}
