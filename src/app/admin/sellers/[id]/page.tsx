import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createAdminSupabaseClient, isSupabaseConfigured, type SellerRow } from '@/lib/supabase-admin';
import { MOCK_SELLERS } from '@/lib/mock-admin-data';
import { DiagnosisForm } from './diagnosis-form';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function SellerDiagnosisPage({ params }: Props) {
  const { id } = await params;

  let seller: SellerRow | null = null;
  let isMock = false;

  if (!isSupabaseConfigured()) {
    isMock = true;
    seller = MOCK_SELLERS.find((s) => s.id === id) ?? null;
  } else {
    try {
      const supabase = createAdminSupabaseClient();
      const { data, error } = await supabase
        .from('sellers')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      seller = data as SellerRow;
    } catch {
      isMock = true;
      seller = MOCK_SELLERS.find((s) => s.id === id) ?? null;
    }
  }

  if (!seller) notFound();

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Link
          href="/admin/sellers"
          className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          ← Sprzedawcy
        </Link>
      </div>

      {seller ? (
        <>
          {isMock && (
            <div className="mb-4 inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 rounded text-xs text-amber-700 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
              Dane demo — email nie zostanie wysłany
            </div>
          )}
          <div className="bg-white border border-gray-200 rounded-lg p-5 mb-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{seller.name}</h1>
                <p className="text-sm text-gray-500 mt-0.5">{seller.email}</p>
              </div>
              <span className="inline-flex px-2.5 py-1 bg-gray-100 rounded text-xs font-medium text-gray-600">
                {seller.category}
              </span>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">Marża</p>
                <p className="font-semibold text-red-600">{seller.yield_pct.toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">Zwroty</p>
                <p className="font-semibold text-gray-900">{seller.return_rate.toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">Na platformie od</p>
                <p className="font-semibold text-gray-900">
                  {new Date(seller.joined_at).toLocaleDateString('pl-PL', { year: 'numeric', month: 'short' })}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <h2 className="text-base font-semibold text-gray-900 mb-5">Diagnoza</h2>
            <DiagnosisForm seller={seller} />
          </div>
        </>
      ) : null}
    </div>
  );
}
