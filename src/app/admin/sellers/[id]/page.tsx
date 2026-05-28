import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createAdminSupabaseClient, type SellerRow } from '@/lib/supabase-admin';
import { DiagnosisForm } from './diagnosis-form';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function SellerDiagnosisPage({ params }: Props) {
  const { id } = await params;

  let seller: SellerRow | null = null;
  let dbError: string | null = null;

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
    dbError = 'Nie można załadować danych sprzedawcy';
  }

  if (!seller && !dbError) notFound();

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

      {dbError ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
          {dbError}
        </div>
      ) : seller ? (
        <>
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
