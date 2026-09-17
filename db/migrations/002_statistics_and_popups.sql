-- Facts and figures editable in the admin panel, and pop-up notices with images.

create table stat_groups (
  id          text primary key,
  as_of       date not null,
  updated_by  text,
  updated_at  timestamptz not null default now()
);

create table stat_items (
  id          bigint generated always as identity primary key,
  group_id    text not null references stat_groups (id) on delete cascade,
  -- Stable name for figures the website refers to directly (e.g. 'houses'); null for rows added by staff.
  key         text,
  label_en    text not null default '',
  label_ne    text not null default '',
  value       numeric(14, 2) not null check (value >= 0),
  sort_order  integer not null default 0,
  -- Core figures are used on the home page and cannot be removed.
  is_core     boolean not null default false,
  unique (group_id, key),
  check (label_en <> '' or label_ne <> '')
);

create index stat_items_group_idx on stat_items (group_id, sort_order, id);

insert into stat_groups (id, as_of) values
  ('reach', '2025-10-28'),
  ('waste', '2025-10-28'),
  ('families', '2025-10-28'),
  ('coverage', '2025-10-28'),
  ('workforce', '2023-08-29'),
  ('gender', '2023-08-29'),
  ('vehicles', '2023-08-29'),
  ('facilities', '2023-08-29');

insert into stat_items (group_id, key, label_en, label_ne, value, sort_order, is_core) values
  ('reach', 'districts', 'Working districts', 'कार्यक्षेत्र जिल्ला', 4, 1, false),
  ('reach', 'municipalities', 'Municipalities served', 'सेवा पुगेका नगरपालिका', 12, 2, true),
  ('reach', 'wards', 'Wards served', 'सेवा पुगेका वडा', 72, 3, true),
  ('reach', 'houses', 'Service-holder houses', 'सेवाग्राही घर', 59229, 4, true),
  ('reach', 'families', 'Service-holder families', 'सेवाग्राही परिवार', 207302, 5, false),
  ('reach', 'population', 'People benefiting directly', 'प्रत्यक्ष लाभान्वित जनसंख्या', 829206, 6, true),

  ('waste', 'total', 'Total waste collected', 'सङ्कलित कुल फोहोर', 239, 1, true),
  ('waste', 'degradable', 'Degradable waste', 'कुहिने फोहोर', 143, 2, false),
  ('waste', 'segregated', 'Degradable waste received already sorted', 'छुट्याएरै प्राप्त कुहिने फोहोर', 36, 3, false),
  ('waste', 'usedAfter', 'Degradable waste reused after collection', 'सङ्कलनपछि सदुपयोग भएको कुहिने फोहोर', 30, 4, false),
  ('waste', 'compost', 'Compost produced', 'उत्पादित कम्पोस्ट मल', 6, 5, false),
  ('waste', 'usedAtHome', 'Degradable waste reused at home', 'घरमै सदुपयोग भएको कुहिने फोहोर', 5.5, 6, false),

  ('families', 'segregated', 'Hand over sorted waste', 'छुट्याएर फोहोर दिने', 21, 1, true),
  ('families', 'mixed', 'Hand over mixed waste', 'मिसाएर फोहोर दिने', 75, 2, true),
  ('families', 'organic', 'Use organic waste themselves', 'कुहिने फोहोर आफैं उपयोग गर्ने', 4, 3, true),

  ('coverage', 'valleyShare', 'Share of all Kathmandu Valley waste handled by us', 'काठमाडौं उपत्यकाको कुल फोहोरमा हाम्रो हिस्सा', 15, 1, true),

  ('workforce', 'collectors', 'Collectors, recyclers and sweepers', 'सङ्कलक, पुनःप्रयोगकर्ता तथा सफाइकर्मी', 221, 1, false),
  ('workforce', 'segregation', 'Waste segregation workers', 'फोहोर छुट्याउने कामदार', 125, 2, false),
  ('workforce', 'drivers', 'Drivers', 'चालक', 55, 3, false),
  ('workforce', 'management', 'Management and administration', 'व्यवस्थापन तथा प्रशासन', 27, 4, false),
  ('workforce', 'technical', 'Technical staff', 'प्राविधिक', 10, 5, false),

  ('gender', 'men', 'Men', 'पुरुष', 80, 1, true),
  ('gender', 'women', 'Women', 'महिला', 20, 2, true),

  ('vehicles', 'rickshaw', 'Rickshaws', 'रिक्सा', 25, 1, false),
  ('vehicles', 'miniTipper', 'Mini tippers', 'साना टिपर', 20, 2, false),
  ('vehicles', 'heavyTipper', 'Heavy tippers', 'ठूला टिपर', 12, 3, false),
  ('vehicles', 'tractor', 'Tractors', 'ट्र्याक्टर', 7, 4, false),
  ('vehicles', 'backhoe', 'Backhoe loaders', 'ब्याकहो लोडर', 2, 5, false),

  ('facilities', 'compostCenter', 'Compost production center', 'कम्पोस्ट मल उत्पादन केन्द्र', 1, 1, false),
  ('facilities', 'paperCenter', 'Paper recycling center', 'कागज पुनःप्रशोधन केन्द्र', 1, 2, false),
  ('facilities', 'shredder', 'Shredding machines', 'फोहोर टुक्र्याउने मेसिन', 3, 3, false),
  ('facilities', 'conveyor', 'Conveyor belt', 'कन्भेयर बेल्ट', 1, 4, false),
  ('facilities', 'mixer', 'Mixer', 'मिक्सर', 1, 5, false),
  ('facilities', 'turner', 'Compost turner', 'कम्पोस्ट टर्नर', 1, 6, false);

-- Notices: optional pop-up with its own title, details and image.
alter table notices
  add column show_banner    boolean not null default true,
  add column show_popup     boolean not null default false,
  add column title_en       text not null default '',
  add column title_ne       text not null default '',
  add column details_en     text not null default '',
  add column details_ne     text not null default '',
  add column image_media_id uuid references media (id) on delete set null,
  add constraint notices_shown_somewhere check (show_banner or show_popup);
