import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface SellerRow {
  id: string;
  name: string;
  category: string;
  yield_pct: number;
  return_rate: number;
  joined_at: string;
  email: string;
}

export interface DiagnosisRow {
  id: string;
  seller_id: string;
  problem: string;
  monthly_loss_pln: number;
  recommended_action: string;
  seller_panel_link: string | null;
  sent_at: string;
  action_status: 'pending' | 'done' | 'not done';
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AdminSupabaseClient = SupabaseClient<any, 'public', any>;

export function isSupabaseConfigured(): boolean {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export function createAdminSupabaseClient(): AdminSupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error('Supabase not configured');
  }

  return createClient(url, key);
}

export function computeMedian(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

export function getFilteredSellers(sellers: SellerRow[]): SellerRow[] {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const categories = [...new Set(sellers.map((s) => s.category))];
  const medians: Record<string, number> = {};
  for (const cat of categories) {
    medians[cat] = computeMedian(
      sellers.filter((s) => s.category === cat).map((s) => s.yield_pct),
    );
  }

  return sellers.filter(
    (s) =>
      new Date(s.joined_at) <= sixMonthsAgo &&
      s.yield_pct < medians[s.category],
  );
}
