# Ember & Roll — Food Stall Demo Website

A mobile-first ordering website for a fictional grilled chicken roll stall in Mirpur, Dhaka. Customers can browse the menu, build a cart, order through WhatsApp, and play a mini game to compete on a live leaderboard.

**Live demo:** https://food-stall-demo.netlify.app/

> "Ember & Roll" is a made-up brand created for this demo project. Menu items and prices are sample data.

## Features

- **Premium dark design**: black and gold theme, serif headings, two fonts only (Playfair Display and Inter), sticky navigation and smooth scrolling
- **Mobile-first layout**: responsive menu grid that adapts from phones to desktops
- **Cart**: slide-out panel, quantity controls, live totals and an "Added to cart" message
- **WhatsApp ordering**: the cart, customer name, phone number, sauce choice and note are turned into a pre-filled WhatsApp message (no paid API needed)
- **Mini game "Catch the Roll"**: a 30-second canvas game with touch and keyboard controls, bombs and a speed ramp
- **Live leaderboard**: top 10 scores loaded from a Supabase database, with a clear tie-break rule (higher score first, earlier score wins ties)
- **Protected score saving**: scores go through a server function that validates them before they reach the database

## Tech stack

| Part | Tool |
| --- | --- |
| Front end | HTML, CSS and vanilla JavaScript (single page) |
| Game | JavaScript Canvas |
| Database | Supabase (PostgreSQL) with Row Level Security |
| Server logic | Netlify Functions (Node.js) |
| Hosting | Netlify, deployed automatically from GitHub |
| Development | AI-assisted ("vibe coding") with Claude |

## How it works

```
Browser (index.html)
   |-- reads top scores ------------------> Supabase (public read-only rule)
   |-- sends name + score ---> Netlify Function (submit-score)
                                   |-- validates the data
                                   |-- saves it using a secret key -> Supabase
```

1. The page reads the leaderboard directly from Supabase using a public key. Row Level Security allows **reading only**.
2. The browser has no permission to insert scores. To save a score, it sends the name and score to the `submit-score` function.
3. The function checks the name length and the score range, then writes to the database using a secret key that is stored only in Netlify environment variables.

## Security notes

- The browser is never trusted: scores are validated on the server, and the public database key cannot write data.
- The secret database key is stored in Netlify environment variables and is never committed to this repository.
- Names shown on the leaderboard are escaped before being displayed, which prevents players from injecting HTML or scripts (XSS).
- **Known limitation:** the server checks that a score is plausible, but it cannot yet prove that a real game was played. Game-session tokens are planned to close this gap.

## Project structure

```
.
├── index.html                          # The whole front end: layout, styles, cart, game, leaderboard
├── netlify/
│   └── functions/
│       └── submit-score.js             # Server function that validates and saves scores
└── README.md
```

## Database setup

Create a `scores` table in Supabase and enable Row Level Security with a read-only policy:

```sql
create table scores (
  id bigint generated always as identity primary key,
  player_name text not null check (char_length(player_name) between 1 and 20),
  score int not null check (score >= 0),
  created_at timestamptz not null default now()
);

alter table scores enable row level security;

create policy "Anyone can read scores"
  on scores for select
  using (true);
```

There is deliberately no insert policy. Only the server function (using the secret key) can add scores.

## Running your own copy

1. Fork or clone this repository.
2. Create a free Supabase project and run the SQL above.
3. In `index.html`, set:
   - `SUPABASE_URL` to your project URL
   - `SUPABASE_KEY` to your **publishable (public)** key
   - `WHATSAPP_NUMBER` to your number in international format without `+` or spaces (for example `8801712345678`)
4. Deploy the repository to Netlify.
5. In Netlify, go to **Project configuration → Environment variables** and add:
   - `SUPABASE_URL`: your Supabase project URL
   - `SUPABASE_SERVICE_KEY`: your Supabase **secret** key (mark it as secret)
6. Trigger a new deploy so the function can read the variables.

> Never put the secret key in `index.html` or commit it to GitHub.

## Roadmap

- [x] Premium dark homepage with hero and menu
- [x] Cart with WhatsApp checkout
- [x] Mini game with bombs and speed ramp
- [x] Database-backed leaderboard
- [x] Server-side score validation
- [ ] Game-session tokens for stronger anti-cheat
- [ ] Admin panel with real authentication (edit menu, view orders, lock the leaderboard)
- [ ] Gallery, about and contact sections
- [ ] Sound effects, favicon and social share image
- [ ] Image optimisation and full real-phone testing

## About

Built by Siam as a learning project to practise AI-assisted web development, covering responsive design, a database, server-side security and free-tier hosting. The design, code and branding are original.
