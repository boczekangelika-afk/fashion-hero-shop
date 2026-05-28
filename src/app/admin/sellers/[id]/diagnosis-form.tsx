'use client';

import { useState } from 'react';
import type { SellerRow } from '@/lib/supabase-admin';

interface Props {
  seller: SellerRow;
}

export function DiagnosisForm({ seller }: Props) {
  const [problem, setProblem] = useState('');
  const [monthlyLoss, setMonthlyLoss] = useState('');
  const [action, setAction] = useState('');
  const [link, setLink] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('sending');
    setErrorMsg('');

    const res = await fetch('/api/admin/diagnose', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        seller_id: seller.id,
        problem,
        monthly_loss_pln: parseFloat(monthlyLoss),
        recommended_action: action,
        seller_panel_link: link || null,
      }),
    });

    if (res.ok) {
      setStatus('sent');
    } else {
      const data = await res.json().catch(() => ({}));
      setErrorMsg(data.error ?? 'Nie udało się wysłać emaila');
      setStatus('error');
    }
  }

  if (status === 'sent') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <p className="text-green-800 font-medium">Email wysłany</p>
        <p className="text-green-600 text-sm mt-1">
          Diagnoza zapisana i wysłana do {seller.email}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {status === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded px-3 py-2 text-sm text-red-700">
          {errorMsg}
        </div>
      )}

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1.5 uppercase tracking-wide">
          Problem
        </label>
        <textarea
          required
          value={problem}
          onChange={(e) => setProblem(e.target.value)}
          rows={4}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-y"
          placeholder="Opisz szczegółowo problem sprzedawcy…"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1.5 uppercase tracking-wide">
          Szacowana miesięczna strata (PLN)
        </label>
        <input
          type="number"
          required
          min={0}
          step={1}
          value={monthlyLoss}
          onChange={(e) => setMonthlyLoss(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          placeholder="np. 3500"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1.5 uppercase tracking-wide">
          Rekomendowane działanie
        </label>
        <textarea
          required
          value={action}
          onChange={(e) => setAction(e.target.value)}
          rows={3}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-y"
          placeholder="Konkretne kroki, które sprzedawca powinien podjąć…"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1.5 uppercase tracking-wide">
          Link do lokalizacji w panelu sprzedawcy
        </label>
        <input
          type="url"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          placeholder="https://panel.fashionhero.pl/..."
        />
      </div>

      <button
        type="submit"
        disabled={status === 'sending'}
        className="w-full bg-gray-900 text-white text-sm font-medium py-2.5 rounded hover:bg-gray-700 transition-colors disabled:opacity-50"
      >
        {status === 'sending' ? 'Wysyłanie…' : 'Wyślij email'}
      </button>
    </form>
  );
}
