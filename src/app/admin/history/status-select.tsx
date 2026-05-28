'use client';

import { useState } from 'react';

type Status = 'pending' | 'done' | 'not done';

interface Props {
  diagnosisId: string;
  initialStatus: Status;
}

const statusLabels: Record<Status, string> = {
  pending: 'Oczekuje',
  done: 'Zrobione',
  'not done': 'Niezrobione',
};

const statusColors: Record<Status, string> = {
  pending: 'text-yellow-700 bg-yellow-50 border-yellow-200',
  done: 'text-green-700 bg-green-50 border-green-200',
  'not done': 'text-red-700 bg-red-50 border-red-200',
};

export function StatusSelect({ diagnosisId, initialStatus }: Props) {
  const [status, setStatus] = useState<Status>(initialStatus);
  const [saving, setSaving] = useState(false);

  async function handleChange(newStatus: Status) {
    setSaving(true);
    const res = await fetch(`/api/admin/history/${diagnosisId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action_status: newStatus }),
    });
    setSaving(false);
    if (res.ok) setStatus(newStatus);
  }

  return (
    <select
      value={status}
      onChange={(e) => handleChange(e.target.value as Status)}
      disabled={saving}
      className={`text-xs font-medium px-2 py-1 rounded border outline-none cursor-pointer transition-colors disabled:opacity-50 ${statusColors[status]}`}
    >
      {(Object.keys(statusLabels) as Status[]).map((s) => (
        <option key={s} value={s}>
          {statusLabels[s]}
        </option>
      ))}
    </select>
  );
}
