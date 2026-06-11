import { cpSync, mkdirSync, rmSync, existsSync } from "node:fs";
import { join } from "node:path";

const root = import.meta.dirname;
const www = join(root, "www");

const files = [
  "index.html",
  "styles.css",
  "app.js",
  "data-store.js",
  "label-parser.js",
  "cloud-sync.js",
  "firebase-config.js",
  "pwa-install.js",
  "service-worker.js",
  "manifest.webmanifest",
];

if (existsSync(www)) {
  rmSync(www, { recursive: true, force: true });
}
mkdirSync(www, { recursive: true });
mkdirSync(join(www, "assets"), { recursive: true });

files.forEach((file) => {
  cpSync(join(root, file), join(www, file));
});
cpSync(join(root, "assets", "icon.svg"), join(www, "assets", "icon.svg"));

console.log("Sklad: web-fayly skopirovany v www/");
