# AGENTS.md

## Cursor Cloud specific instructions

This repository contains a dependency-free static prototype for **MyFitClub**, a
private fitness club messenger/community app.

- **Dependencies:** None to install. The VM update script can remain a no-op
  (`true`).
- **Run:** Serve the repository root with a static server:

  ```bash
  python3 -m http.server 4173
  ```

  Then open `http://localhost:4173`.
- **Lint / test / build:** There is no package-managed build yet. For basic
  verification, start the static server and request `index.html`, `styles.css`
  and `app.js`.
- **Git:** Standard `git` operations against `origin` are the development
  workflow.

When a real app stack is added (for example Flutter, FlutterFlow export,
Firebase functions, `package.json`, `docker-compose.yml`, or a `Makefile`),
extend this section with setup, run, lint, test and build commands.
