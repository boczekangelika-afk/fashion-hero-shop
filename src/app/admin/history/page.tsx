import { createAdminSupabaseClient, isSupabaseConfigured } from '@/lib/supabase-admin';
import { MOCK_DIAGNOSES } from '@/lib/mock-admin-data';
import { StatusSelect } from './status-select';

export const dynamic = 'force-dynamic';

export default async function AdminHistoryPage() {
  type DiagnosisEntry = {
    id: string;
    seller_id: string;
    problem: string;
    recommended_action: string;
    sent_at: string;
    action_status: 'pending' | 'done' | 'not done';
    sellers: { name: string } | null;
  };

  let diagnoses: DiagnosisEntry[] = [];
  let isMock = false;

  if (!isSupabaseConfigured()) {
    isMock = true;
    diagnoses = MOCK_DIAGNOSES;
  } else {
    try {
      const supabase = createAdminSupabaseClient();
      const { data, error } = await supabase
        .from('diagnoses')
        .select('id, seller_id, problem, recommended_action, sent_at, action_status, sellers(name)')
        .order('sent_at', { ascending: false });
      if (error) throw error;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      diagnoses = (data ?? []) as unknown as DiagnosisEntry[];
    } catch {
      isMock = true;
      diagnoses = MOCK_DIAGNOSES;
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Historia wysłanych diagnoz</h1>
          <p className="text-sm text-gray-500 mt-1">Wszystkie interwencje i ich status</p>
        </div>
        {isMock && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 rounded text-xs text-amber-700 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
            Dane demo
          </span>
        )}
      </div>

      {diagnoses.length === 0 ? (
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
