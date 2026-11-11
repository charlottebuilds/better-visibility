import { readdir, readFile, stat } from "node:fs/promises";
import { resolve, join } from "node:path";

const root = resolve(".output/public");
const routes = ["", "de", "en", "es"].flatMap((locale) =>
  ["", "impressum", "datenschutz"].map((page) =>
    [locale, page, "index.html"].filter(Boolean).join("/"),
  ),
);

async function inspect(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (["_worker.js", "_routes.json", "server", "functions"].includes(entry.name)) {
      throw new Error(`Server-dependent artifact in static upload: ${join(directory, entry.name)}`);
    }
    if (entry.isDirectory()) await inspect(join(directory, entry.name));
  }
}

await inspect(root);
let assetCount = 0;
for (const route of routes) {
  const html = await readFile(join(root, route), "utf8");
  if (!/<!doctype html>/i.test(html) || !html.includes("Better Visibility")) {
    throw new Error(`Missing or invalid prerendered HTML: ${route}`);
  }
  if (/Something went wrong!|Blog momentan nicht erreichbar\.|Blog konnte nicht geladen werden\.|This page didn't load/.test(html)) {
    throw new Error(`Prerender captured an error page: ${route}. Check public blog build-time configuration.`);
  }
  const assets = [...html.matchAll(/(?:src|href)="(\/assets\/[^"?#]+)[^"]*"/g)];
  if (assets.length === 0) throw new Error(`No generated assets referenced by ${route}`);
  for (const [, asset] of assets) {
    if (!asset || !(await stat(join(root, asset.slice(1)))).isFile()) {
      throw new Error(`Missing generated asset in ${route}`);
    }
    assetCount++;
  }
}
console.log(`Verified ${routes.length} static HTML pages and ${assetCount} asset references in .output/public; no Pages Worker.`);