# AGENTS.md

## Cursor Cloud specific instructions

This repository contains dependency-free static prototypes:

- **MyFitClub** — private fitness club messenger (`MyFitClub/`)
- **Sklad** — warehouse app for furniture/appliances (`Sklad/`)

- **Dependencies:** None to install. The VM update script can remain a no-op
  (`true`).
- **Run:** Serve the `MyFitClub/` folder with a static server:

  ```bash
  cd MyFitClub && python3 -m http.server 4173
  ```

  Then open `http://localhost:4173`.

  **Sklad:**

  ```bash
  cd Sklad && python3 -m http.server 4174
  ```

  Then open `http://localhost:4174` (phone + PC modes in one app).

- **Lint / test / build:** There is no package-managed build yet. For basic
  verification, start the static server and request `index.html`, `styles.css`,
  and the project's JS modules (`app.js`, `data-store.js`, etc.).
- **Git:** Standard `git` operations against `origin` are the development
  workflow.

When a real app stack is added (for example Flutter, FlutterFlow export,
Firebase functions, `package.json`, `docker-compose.yml`, or a `Makefile`),
extend this section with setup, run, lint, test and build commands.
