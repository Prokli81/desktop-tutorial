# MyFitClub

MyFitClub is a Russian-language prototype for a private fitness club app. It
shows the first product direction for a closed community where clients, trainers
and admins can communicate, view schedules and stay inside one club space.

## What is included

- invitation-code entry with demo roles;
- club dashboard;
- main club chat with local demo messages;
- private-message overview;
- topic groups;
- class schedule with local demo booking;
- notification center;
- profile screen;
- admin panel shown only for the admin role;
- Russian product blueprint in `docs/product-blueprint.md`;
- step-by-step development order in `docs/step-by-step.md`.

## Demo invitation codes

- `CLIENT2026` - client view;
- `TRAINER2026` - trainer view;
- `ADMIN2026` - admin view with the admin panel.

## Run locally

No dependencies are required. Open `index.html` in a browser, or serve the
folder with any static server:

```bash
python3 -m http.server 4173
```

Then open `http://localhost:4173`.

The prototype stores demo session and class bookings in browser `localStorage`, so
it can show role switching and booking state without a backend.

## Product documentation

See:

- `docs/product-blueprint.md` for the Russian-language product plan, roles, MVP
  scope, screens, data model and recommended implementation stack;
- `docs/step-by-step.md` for the ordered development path from prototype to a
  real mobile app.

## Next product steps

This is a static prototype. The next technical step is to connect a real backend
or app builder stack such as FlutterFlow + Firebase, then replace demo data with:

- authentication;
- invite-code validation;
- persisted chats and messages;
- push notifications;
- admin management screens;
- iOS/Android packaging.
