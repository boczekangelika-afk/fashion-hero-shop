import Link from 'next/link';
import {
  createAdminSupabaseClient,
  getFilteredSellers,
  isSupabaseConfigured,
  type SellerRow,
} from '@/lib/supabase-admin';
import { MOCK_SELLERS } from '@/lib/mock-admin-data';

export const dynamic = 'force-dynamic';

function computeMedianMap(sellers: SellerRow[]): Record<string, number> {
  const categories = [...new Set(sellers.map((s) => s.category))];
  const result: Record<string, number> = {};
  for (const cat of categories) {
    const vals = sellers.filter((s) => s.category === cat).map((s) => s.yield_pct).sort((a, b) => a - b);
    const mid = Math.floor(vals.length / 2);
    result[cat] = vals.length % 2 !== 0 ? vals[mid] : (vals[mid - 1] + vals[mid]) / 2;
  }
  return result;
}

function riskLevel(yieldPct: number, median: number): 'high' | 'medium' {
  const gap = median - yieldPct;
  return gap >= 5 ? 'high' : 'medium';
}

export default async function AdminSellersPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category: categoryFilter } = await searchParams;

  let allSellers: SellerRow[] = [];
  let filtered: SellerRow[] = [];
  let isMock = false;

  if (!isSupabaseConfigured()) {
    isMock = true;
    allSellers = MOCK_SELLERS;
  } else {
    try {
      const supabase = createAdminSupabaseClient();
      const { data, error } = await supabase.from('sellers').select('*');
      if (error) throw error;
      allSellers = (data ?? []) as SellerRow[];
    } catch {
      isMock = true;
      allSellers = MOCK_SELLERS;
    }
  }

  filtered = getFilteredSellers(allSellers);
  const medianMap = computeMedianMap(allSellers);

  // Category filter
  const categories = [...new Set(filtered.map((s) => s.category))].sort();
  const displaySellers = categoryFilter
    ? filtered.filter((s) => s.category === categoryFilter)
    : filtered;

  // Stats
  const avgYield = filtered.length
    ? filtered.reduce((sum, s) => sum + s.yield_pct, 0) / filtered.length
    : 0;
  const avgReturn = filtered.length
    ? filtered.reduce((sum, s) => sum + s.return_rate, 0) / filtered.length
    : 0;
  const highRiskCount = filtered.filter(
    (s) => riskLevel(s.yield_pct, medianMap[s.category]) === 'high',
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Sprzedawcy do interwencji</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Konta ≥ 6 miesięcy z marżą poniżej mediany kategorii
          </p>
        </div>
        {isMock && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 rounded text-xs text-amber-700 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
            Dane demo — skonfiguruj Supabase
          </span>
        )}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg px-5 py-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Wymaga interwencji</p>
          <p className="text-2xl font-bold text-gray-900">{filtered.length}</p>
          <p className="text-xs text-gray-400 mt-0.5">sprzedawców</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg px-5 py-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Wysoki priorytet</p>
          <p className="text-2xl font-bold text-red-600">{highRiskCount}</p>
          <p className="text-xs text-gray-400 mt-0.5">marża ≥ 5 pp poniżej mediany</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg px-5 py-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Śr. marża / zwroty</p>
          <p className="text-2xl font-bold text-gray-900">
            {avgYield.toFixed(1)}%
            <span className="text-base font-normal text-gray-400 ml-1">/ {avgReturn.toFixed(1)}%</span>
          </p>
          <p className="text-xs text-gray-400 mt-0.5">w tej grupie</p>
        </div>
      </div>

      {/* Category filter */}
      {categories.length > 1 && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Kategoria:</span>
          <Link
            href="/admin/sellers"
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              !categoryFilter
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Wszystkie ({filtered.length})
          </Link>
          {categories.map((cat) => {
            const count = filtered.filter((s) => s.category === cat).length;
            return (
              <Link
                key={cat}
                href={`/admin/sellers?category=${encodeURIComponent(cat)}`}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  categoryFilter === cat
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat} ({count})
              </Link>
            );
          })}
        </div>
      )}

      {/* Table */}
      {displaySellers.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center text-sm text-gray-500">
          Brak sprzedawców spełniających kryteria
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-600 text-xs uppercase tracking-wide">Sprzedawca</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 text-xs uppercase tracking-wide">Kategoria</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600 text-xs uppercase tracking-wide">Marża</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600 text-xs uppercase tracking-wide">Mediana kat.</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600 text-xs uppercase tracking-wide">Zwroty</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 text-xs uppercase tracking-wide">Priorytet</th>
              </tr>
            </thead>
            <tbody>
              {displaySellers.map((seller) => {
                const median = medianMap[seller.category];
                const gap = median - seller.yield_pct;
                const risk = riskLevel(seller.yield_pct, median);
                return (
                  <tr
                    key={seller.id}
                    className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-3">
                      <Link href={`/admin/sellers/${seller.id}`} className="block">
                        <p className="font-medium text-gray-900">{seller.name}</p>
                        <p className="text-xs text-gray-400 font-mono">{seller.id}</p>
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/sellers/${seller.id}`} className="block">
                        <span className="inline-flex px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-600">
                          {seller.category}
                        </span>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/admin/sellers/${seller.id}`} className="block font-semibold text-red-600">
                        {seller.yield_pct.toFixed(1)}%
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/admin/sellers/${seller.id}`} className="block text-gray-500">
                        {median.toFixed(1)}%
                        <span className="text-xs text-red-400 ml-1">−{gap.toFixed(1)}</span>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/admin/sellers/${seller.id}`} className="block text-gray-600">
                        {seller.return_rate.toFixed(1)}%
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/sellers/${seller.id}`} className="block">
                        {risk === 'high' ? (
                          <span className="inline-flex px-2 py-0.5 bg-red-50 border border-red-200 rounded text-xs text-red-700 font-medium">
                            Wysoki
                          </span>
                        ) : (
                          <span className="inline-flex px-2 py-0.5 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-700 font-medium">
                            Średni
                          </span>
                        )}
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="px-4 py-2 border-t border-gray-100 bg-gray-50 text-xs text-gray-400">
            {displaySellers.length} z {filtered.length} sprzedawców
          </div>
        </div>
      )}
    </div>
  );
}
