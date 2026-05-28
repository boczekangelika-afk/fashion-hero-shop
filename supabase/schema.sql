-- Admin panel schema
-- Run this in Supabase SQL editor

create table if not exists sellers (
  id          text primary key,
  name        text not null,
  category    text not null,
  yield_pct   numeric(5,2) not null,
  return_rate numeric(5,2) not null,
  joined_at   timestamptz not null,
  email       text not null
);

create table if not exists diagnoses (
  id                   uuid primary key default gen_random_uuid(),
  seller_id            text references sellers(id) on delete cascade,
  problem              text not null,
  monthly_loss_pln     numeric(10,2) not null,
  recommended_action   text not null,
  seller_panel_link    text,
  sent_at              timestamptz not null default now(),
  action_status        text not null default 'pending'
    check (action_status in ('pending', 'done', 'not done'))
);

create index if not exists diagnoses_seller_id_idx on diagnoses(seller_id);
create index if not exists diagnoses_sent_at_idx on diagnoses(sent_at desc);
