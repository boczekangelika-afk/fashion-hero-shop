-- Seed 10 mock sellers for testing
-- Category medians are computed over all sellers per category
-- Sellers that appear in /admin/sellers (age ≥ 6mo AND yield < category median)
-- are marked with: ← FILTERS IN

-- Odzież median yield: sorted [8.5, 9.2, 10.8, 22.5, 25.0] → median = 10.8
-- Obuwie median yield: sorted [7.5, 18.0] → median = 12.75
-- Akcesoria median yield: sorted [14.5, 21.0, 28.0] → median = 21.0

insert into sellers (id, name, category, yield_pct, return_rate, joined_at, email) values
  ('s1',  'UrbanEdge',       'Odzież',    22.5,  3.2,  now() - interval '17 months', 'urbanedge@example.com'),
  ('s2',  'Bella Donna',     'Odzież',     8.5, 14.5,  now() - interval '12 months', 'belladonna@example.com'),   -- ← FILTERS IN
  ('s3',  'SportPeak',       'Obuwie',    18.0,  4.8,  now() - interval '15 months', 'sportpeak@example.com'),
  ('s4',  'Modna Szafa',     'Odzież',     9.2, 16.0,  now() - interval '10 months', 'modna@example.com'),        -- ← FILTERS IN
  ('s5',  'Sneaker Lab',     'Obuwie',     7.5, 18.2,  now() - interval '11 months', 'sneakerlab@example.com'),   -- ← FILTERS IN
  ('s6',  'EcoThreads',      'Akcesoria', 28.0,  2.1,  now() - interval '12 months', 'ecothreads@example.com'),
  ('s7',  'Classic Fit',     'Odzież',    10.8, 11.2,  now() - interval '9 months',  'classicfit@example.com'),
  ('s8',  'Marta Handmade',  'Akcesoria', 14.5,  8.8,  now() - interval '15 months', 'marta@example.com'),        -- ← FILTERS IN
  ('s9',  'VintageFind',     'Akcesoria', 21.0,  6.5,  now() - interval '8 months',  'vintage@example.com'),
  ('s10', 'DropStyle',       'Odzież',    25.0,  3.5,  now() - interval '3 months',  'dropstyle@example.com')
on conflict (id) do nothing;
