# MyFitClub

MyFitClub is a Russian-language prototype for a private fitness club app. It
shows the first product direction for a closed community where clients, trainers
and admins can communicate, view schedules and stay inside one club space.

## What is included

- local registration and login prototype with invitation-code role assignment;
- local data-store prototype for users, invite codes, chats, messages, bookings and notifications;
- club dashboard;
- main club chat with local demo messages;
- private-message overview;
- topic groups;
- class schedule with local demo booking;
- notification center;
- profile screen;
- admin panel shown only for the admin role, with local forms for invite codes, groups and schedule events;
- screen map/design section inside the prototype;
- PWA setup with manifest, app icon and service worker;
- GitHub Pages workflow for publishing the `MyFitClub/` folder online;
- Russian product blueprint in `docs/product-blueprint.md`;
- step-by-step development order in `docs/step-by-step.md`.

## Demo invitation codes

- `CLIENT2026` - client view;
- `TRAINER2026` - trainer view;
- `ADMIN2026` - admin view with the admin panel.

## Run locally

No dependencies are required. Open `index.html` in a browser, or serve this
`MyFitClub/` folder with any static server:

```bash
cd MyFitClub
python3 -m http.server 4173
```

Then open `http://localhost:4173`.

The prototype stores demo accounts, session, chats, messages, invite codes,
notifications and class bookings in browser `localStorage`, so it can show
registration, login, role switching, chat history, booking state and collection
counters without a backend.

## Product documentation

See:

- `docs/product-blueprint.md` for the Russian-language product plan, roles, MVP
  scope, screens, data model and recommended implementation stack;
- `docs/step-by-step.md` for the ordered development path from prototype to a
  real mobile app;
- `docs/auth-flow.md` for the registration, login and invite-code flow;
- `docs/database-plan.md` for the local database collections and Firebase migration path;
- `docs/chat-flow.md` for the unified chat/message model;
- `docs/admin-panel.md` for admin actions and production rules;
- `docs/deployment.md` for GitHub Pages publishing and PWA installation;
- `docs/design-system.md` for the visual system and screen responsibilities.

## Next product steps

This is a static prototype. The next technical step is to connect a real backend
or app builder stack such as FlutterFlow + Firebase, then replace demo data with:

- authentication;
- invite-code validation;
- persisted chats and messages;
- push notifications;
- admin management screens;
- iOS/Android packaging.

## Publish online

The repository includes `.github/workflows/pages.yml` to deploy the `MyFitClub/`
folder to GitHub Pages after the workflow is enabled and merged to `main`.
See `docs/deployment.md` for the exact steps.
