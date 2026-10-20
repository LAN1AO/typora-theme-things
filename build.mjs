#!/usr/bin/env node
/**
 * Build the distributable Typora themes from src/.
 *
 *   node build.mjs
 *
 * Each output file is self-contained: palette, Typora variable mapping and
 * shared rules are concatenated in that order. Only the optional JetBrains
 * Mono files in themes/things/ are referenced externally.
 */

import { readFileSync, writeFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));

const BANNER = `/*!
 * Things for Typora v${pkg.version}
 * A Typora port of Obsidian Things v2.2.4 by Colin Eckert.
 * https://github.com/colineckert/obsidian-things
 *
 * Upstream theme: MIT © Colin Eckert
 * Typora adaptation: MIT © ${new Date().getFullYear()} Things for Typora contributors
 *
 * Light/dark palettes live in src/tokens-*.css, shared rules in src/base.css.
 * Edit those files, then run \`node build.mjs\` — do not edit themes/*.css.
 */`;

const themes = [
  { name: "light", file: "things-light.css" },
  { name: "dark", file: "things-dark.css" },
];

/** Crude but useful structural check that ignores comments and strings. */
function validateCss(css, file) {
  const stripped = css
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/"(?:\\.|[^"\\])*"/g, '""')
    .replace(/'(?:\\.|[^'\\])*'/g, "''");

  const counts = { "{": 0, "}": 0, "(": 0, ")": 0 };
  for (const ch of stripped) {
    if (ch in counts) counts[ch] += 1;
  }

  if (counts["{"] !== counts["}"]) {
    throw new Error(
      `${file}: unbalanced braces (${counts["{"]} { vs ${counts["}"]} })`,
    );
  }
  if (counts["("] !== counts[")"]) {
    throw new Error(
      `${file}: unbalanced parentheses (${counts["("]} ( vs ${counts[")"]} ))`,
    );
  }
  if (/@import\b/.test(stripped)) {
    throw new Error(`${file}: @import found — themes must stay self-contained`);
  }
}

for (const theme of themes) {
  const tokens = readFileSync(
    join(root, "src", `tokens-${theme.name}.css`),
    "utf8",
  );
  const base = readFileSync(join(root, "src", "base.css"), "utf8");
  const css = `@charset "UTF-8";\n${BANNER}\n\n${tokens}\n\n${base}`;

  validateCss(css, theme.file);

  const out = join(root, "themes", theme.file);
  writeFileSync(out, css, "utf8");
  const kb = (statSync(out).size / 1024).toFixed(1);
  console.log(`built themes/${theme.file} (${kb} kB)`);
}

console.log("done");
