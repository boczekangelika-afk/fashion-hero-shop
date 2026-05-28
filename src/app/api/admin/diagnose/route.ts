import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createAdminSupabaseClient, type SellerRow } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (!body) {
    return NextResponse.json({ error: 'Nieprawidłowe dane' }, { status: 400 });
  }

  const { seller_id, problem, monthly_loss_pln, recommended_action, seller_panel_link } = body as {
    seller_id?: string;
    problem?: string;
    monthly_loss_pln?: number;
    recommended_action?: string;
    seller_panel_link?: string | null;
  };

  if (!seller_id || !problem || monthly_loss_pln == null || !recommended_action) {
    return NextResponse.json({ error: 'Brakujące pola' }, { status: 400 });
  }

  // Fetch seller
  const supabase = createAdminSupabaseClient();
  const { data: sellerData, error: sellerError } = await supabase
    .from('sellers')
    .select('*')
    .eq('id', seller_id)
    .single();
  const seller = sellerData as SellerRow | null;

  if (sellerError || !seller) {
    return NextResponse.json({ error: 'Sprzedawca nie znaleziony' }, { status: 404 });
  }

  // Send email via Resend
  const resendKey = process.env.RESEND_API_KEY;
  const domain = process.env.RESEND_FROM_DOMAIN ?? 'fashionhero.pl';

  if (!resendKey) {
    return NextResponse.json({ error: 'Brak konfiguracji Resend (RESEND_API_KEY)' }, { status: 500 });
  }

  const resend = new Resend(resendKey);
  const { error: emailError } = await resend.emails.send({
    from: `platforma@${domain}`,
    to: [seller.email],
    subject: 'Twoja marża — co wymaga uwagi',
    html: buildEmailHtml({
      sellerName: seller.name,
      problem,
      monthlyLossPln: monthly_loss_pln,
      recommendedAction: recommended_action,
      sellerPanelLink: seller_panel_link ?? null,
    }),
  });

  if (emailError) {
    return NextResponse.json(
      { error: `Błąd wysyłki emaila: ${emailError.message}` },
      { status: 500 },
    );
  }

  // Save diagnosis to DB
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: insertError } = await supabase.from('diagnoses').insert([{
    seller_id,
    problem,
    monthly_loss_pln,
    recommended_action,
    seller_panel_link: seller_panel_link ?? null,
    action_status: 'pending',
  }] as any);

  if (insertError) {
    return NextResponse.json(
      { error: `Email wysłany, ale błąd zapisu: ${insertError.message}` },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}

function buildEmailHtml({
  sellerName,
  problem,
  monthlyLossPln,
  recommendedAction,
  sellerPanelLink,
}: {
  sellerName: string;
  problem: string;
  monthlyLossPln: number;
  recommendedAction: string;
  sellerPanelLink: string | null;
}): string {
  const loss = new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(
    monthlyLossPln,
  );

  return `
<!DOCTYPE html>
<html lang="pl">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:system-ui,-apple-system,sans-serif;color:#212121;background:#f8f9fa;margin:0;padding:32px 0;">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:8px;overflow:hidden;border:1px solid #e5e7eb;">
    <div style="background:#212121;padding:24px 32px;">
      <p style="color:#ffffff;font-size:18px;font-weight:600;margin:0;">FashionHero</p>
    </div>
    <div style="padding:32px;">
      <p style="font-size:15px;margin:0 0 24px;">Cześć <strong>${sellerName}</strong>,</p>
      <p style="font-size:15px;margin:0 0 24px;color:#6b6b6b;">
        Nasz zespół przeanalizował wyniki Twojego konta i zidentyfikował obszar wymagający uwagi.
      </p>

      <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:6px;padding:20px;margin-bottom:24px;">
        <p style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.6px;color:#991b1b;margin:0 0 8px;">Zidentyfikowany problem</p>
        <p style="font-size:14px;color:#212121;margin:0;line-height:1.6;">${problem}</p>
      </div>

      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:6px;padding:20px;margin-bottom:24px;">
        <p style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.6px;color:#166534;margin:0 0 8px;">Rekomendowane działanie</p>
        <p style="font-size:14px;color:#212121;margin:0;line-height:1.6;">${recommendedAction}</p>
      </div>

      <div style="border:1px solid #e5e7eb;border-radius:6px;padding:16px;margin-bottom:24px;display:flex;justify-content:space-between;align-items:center;">
        <p style="font-size:12px;color:#6b6b6b;margin:0;text-transform:uppercase;letter-spacing:0.5px;">Szacowana miesięczna strata</p>
        <p style="font-size:20px;font-weight:700;color:#991b1b;margin:0;">${loss}</p>
      </div>

      ${
        sellerPanelLink
          ? `<p style="margin-bottom:24px;"><a href="${sellerPanelLink}" style="display:inline-block;background:#212121;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:6px;font-size:13px;font-weight:500;">Przejdź do panelu sprzedawcy →</a></p>`
          : ''
      }

      <p style="font-size:13px;color:#6b6b6b;margin:0;border-top:1px solid #f0f0f0;padding-top:24px;">
        W razie pytań odpowiedz na tego emaila.<br>
        Zespół FashionHero
      </p>
    </div>
  </div>
</body>
</html>`;
}
