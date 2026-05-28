import type { SellerRow, DiagnosisRow } from './supabase-admin';

export const MOCK_SELLERS: SellerRow[] = [
  { id: 's1',  name: 'UrbanEdge',      category: 'Odzież',    yield_pct: 22.5, return_rate: 3.2,  joined_at: new Date(Date.now() - 17 * 30 * 24 * 60 * 60 * 1000).toISOString(), email: 'urbanedge@example.com' },
  { id: 's2',  name: 'Bella Donna',    category: 'Odzież',    yield_pct:  8.5, return_rate: 14.5, joined_at: new Date(Date.now() - 12 * 30 * 24 * 60 * 60 * 1000).toISOString(), email: 'belladonna@example.com' },
  { id: 's3',  name: 'SportPeak',      category: 'Obuwie',    yield_pct: 18.0, return_rate: 4.8,  joined_at: new Date(Date.now() - 15 * 30 * 24 * 60 * 60 * 1000).toISOString(), email: 'sportpeak@example.com' },
  { id: 's4',  name: 'Modna Szafa',    category: 'Odzież',    yield_pct:  9.2, return_rate: 16.0, joined_at: new Date(Date.now() - 10 * 30 * 24 * 60 * 60 * 1000).toISOString(), email: 'modna@example.com' },
  { id: 's5',  name: 'Sneaker Lab',    category: 'Obuwie',    yield_pct:  7.5, return_rate: 18.2, joined_at: new Date(Date.now() - 11 * 30 * 24 * 60 * 60 * 1000).toISOString(), email: 'sneakerlab@example.com' },
  { id: 's6',  name: 'EcoThreads',     category: 'Akcesoria', yield_pct: 28.0, return_rate: 2.1,  joined_at: new Date(Date.now() - 12 * 30 * 24 * 60 * 60 * 1000).toISOString(), email: 'ecothreads@example.com' },
  { id: 's7',  name: 'Classic Fit',    category: 'Odzież',    yield_pct: 10.8, return_rate: 11.2, joined_at: new Date(Date.now() -  9 * 30 * 24 * 60 * 60 * 1000).toISOString(), email: 'classicfit@example.com' },
  { id: 's8',  name: 'Marta Handmade', category: 'Akcesoria', yield_pct: 14.5, return_rate: 8.8,  joined_at: new Date(Date.now() - 15 * 30 * 24 * 60 * 60 * 1000).toISOString(), email: 'marta@example.com' },
  { id: 's9',  name: 'VintageFind',    category: 'Akcesoria', yield_pct: 21.0, return_rate: 6.5,  joined_at: new Date(Date.now() -  8 * 30 * 24 * 60 * 60 * 1000).toISOString(), email: 'vintage@example.com' },
  { id: 's10', name: 'DropStyle',      category: 'Odzież',    yield_pct: 25.0, return_rate: 3.5,  joined_at: new Date(Date.now() -  3 * 30 * 24 * 60 * 60 * 1000).toISOString(), email: 'dropstyle@example.com' },
];

export const MOCK_DIAGNOSES: Array<DiagnosisRow & { sellers: { name: string } | null }> = [
  {
    id: 'd1',
    seller_id: 's2',
    problem: 'Marża poniżej mediany kategorii Odzież od 3 kwartałów. Główna przyczyna: zbyt wysokie koszty zwrotów i niska cena sprzedaży względem kosztu zakupu.',
    monthly_loss_pln: 4200,
    recommended_action: 'Podnieść ceny o min. 15% lub ograniczyć asortyment do produktów o marży >12%. Przejrzeć politykę zwrotów.',
    seller_panel_link: 'https://panel.fashionhero.pl/pricing',
    sent_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    action_status: 'pending',
    sellers: { name: 'Bella Donna' },
  },
  {
    id: 'd2',
    seller_id: 's5',
    problem: 'Wysoki wskaźnik zwrotów (18.2%) w kategorii Obuwie. Prawdopodobna przyczyna: nieprecyzyjny opis rozmiarówki.',
    monthly_loss_pln: 2800,
    recommended_action: 'Dodać szczegółowe tabele rozmiarów z miarami w cm. Zaktualizować zdjęcia produktowe.',
    seller_panel_link: null,
    sent_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    action_status: 'done',
    sellers: { name: 'Sneaker Lab' },
  },
];
