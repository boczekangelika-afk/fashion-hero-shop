import { createAdminSupabaseClient } from '@/lib/supabase-admin';
import { StatusSelect } from './status-select';

export const dynamic = 'force-dynamic';

export default async function AdminHistoryPage() {
  let diagnoses: Array<{
    id: string;
    seller_id: string;
    problem: string;
    recommended_action: string;
    sent_at: string;
    action_status: 'pending' | 'done' | 'not done';
    sellers: { name: string } | null;
  }> = [];
  let dbError: string | null = null;

  try {
    const supabase = createAdminSupabaseClient();
    const { data, error } = await supabase
      .from('diagnoses')
      .select('id, seller_id, problem, recommended_action, sent_at, action_status, sellers(name)')
      .order('sent_at', { ascending: false });
    if (error) throw error;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    diagnoses = (data ?? []) as unknown as typeof diagnoses;
  } catch (err) {
    dbError = err instanceof Error ? err.message : 'Błąd połączenia z bazą danych';
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Historia wysłanych diagnoz</h1>
        <p className="text-sm text-gray-500 mt-1">Wszystkie interwencje i ich status</p>
      </div>

      {dbError ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
          {dbError}
        </div>
      ) : diagnoses.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center text-sm text-gray-500">
          Brak wysłanych diagnoz
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-600 text-xs uppercase tracking-wide">Sprzedawca</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 text-xs uppercase tracking-wide">Data wysłania</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 text-xs uppercase tracking-wide">Skrót diagnozy</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 text-xs uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody>
              {diagnoses.map((d) => (
                <tr key={d.id} className="border-b border-gray-100 last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{d.sellers?.name ?? d.seller_id}</p>
                    <p className="text-xs text-gray-400 font-mono">{d.seller_id}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                    {new Date(d.sent_at).toLocaleDateString('pl-PL', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </td>
                  <td className="px-4 py-3 max-w-xs">
                    <p className="text-gray-700 truncate" title={d.problem}>
                      {d.problem}
                    </p>
                    <p className="text-xs text-gray-400 truncate mt-0.5" title={d.recommended_action}>
                      Akcja: {d.recommended_action}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <StatusSelect diagnosisId={d.id} initialStatus={d.action_status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4 py-2 border-t border-gray-100 bg-gray-50 text-xs text-gray-400">
            {diagnoses.length} {diagnoses.length === 1 ? 'rekord' : 'rekordów'}
          </div>
        </div>
      )}
    </div>
  );
}
