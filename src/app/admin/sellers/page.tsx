import Link from 'next/link';
import { createAdminSupabaseClient, getFilteredSellers } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

export default async function AdminSellersPage() {
  let sellers;
  let dbError: string | null = null;

  try {
    const supabase = createAdminSupabaseClient();
    const { data, error } = await supabase.from('sellers').select('*');
    if (error) throw error;
    sellers = getFilteredSellers(data ?? []);
  } catch (err) {
    dbError = err instanceof Error ? err.message : 'Błąd połączenia z bazą danych';
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Sprzedawcy do interwencji</h1>
        <p className="text-sm text-gray-500 mt-1">
          Konta starsze niż 6 miesięcy z marżą poniżej mediany kategorii
        </p>
      </div>

      {dbError ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
          {dbError}
        </div>
      ) : !sellers || sellers.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center text-sm text-gray-500">
          Brak sprzedawców spełniających kryteria
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-600 text-xs uppercase tracking-wide">ID</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 text-xs uppercase tracking-wide">Nazwa</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 text-xs uppercase tracking-wide">Kategoria</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600 text-xs uppercase tracking-wide">Marża %</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600 text-xs uppercase tracking-wide">Zwroty %</th>
              </tr>
            </thead>
            <tbody>
              {sellers.map((seller) => (
                <tr
                  key={seller.id}
                  className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/sellers/${seller.id}`}
                      className="block w-full h-full text-gray-400 text-xs font-mono"
                    >
                      {seller.id}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/sellers/${seller.id}`}
                      className="font-medium text-gray-900 hover:text-gray-600 transition-colors"
                    >
                      {seller.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/sellers/${seller.id}`} className="block text-gray-600">
                      <span className="inline-flex px-2 py-0.5 bg-gray-100 rounded text-xs">
                        {seller.category}
                      </span>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/sellers/${seller.id}`} className="block text-red-600 font-medium">
                      {seller.yield_pct.toFixed(1)}%
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/sellers/${seller.id}`} className="block text-gray-600">
                      {seller.return_rate.toFixed(1)}%
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4 py-2 border-t border-gray-100 bg-gray-50 text-xs text-gray-400">
            {sellers.length} {sellers.length === 1 ? 'sprzedawca' : 'sprzedawców'}
          </div>
        </div>
      )}
    </div>
  );
}
