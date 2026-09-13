#!/usr/bin/env node
// Reads the semantic tokens out of src/app/globals.css and checks the pairs we
// actually ship. Text pairs must clear 4.5:1, required UI pairs 3:1.
import { readFile } from "node:fs/promises";

const css = await readFile(
  new URL("../src/app/globals.css", import.meta.url),
  "utf8",
);

const root = css.slice(css.indexOf(":root"), css.indexOf("@theme"));
const tokens = { white: "#ffffff" };
for (const [, name, value] of root.matchAll(/--([a-z-]+):\s*(#[0-9a-fA-F]{6});/g)) {
  tokens[name] = value;
}

function channel(value) {
  const c = value / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function luminance(hex) {
  const n = parseInt(hex.slice(1), 16);
  return (
    0.2126 * channel((n >> 16) & 255) +
    0.7152 * channel((n >> 8) & 255) +
    0.0722 * channel(n & 255)
  );
}

function contrast(a, b) {
  const la = luminance(a);
  const lb = luminance(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

const PAIRS = [
  ["ink", "background", 4.5],
  ["ink", "surface", 4.5],
  ["ink", "surface-warm", 4.5],
  ["ink", "primary-soft", 4.5],
  ["ink", "accent-soft", 4.5],
  ["ink", "highlight-soft", 4.5],
  ["muted", "background", 4.5],
  ["muted", "surface", 4.5],
  ["white", "primary", 4.5],
  ["white", "primary-hover", 4.5],
  ["accent", "surface", 4.5],
  ["accent", "accent-soft", 4.5],
  ["warning", "warning-soft", 4.5],
  ["error", "surface", 4.5],
  ["border", "surface", null],
  ["focus-ring", "background", 3],
];

let failures = 0;
const rows = [];

for (const [fg, bg, min] of PAIRS) {
  const fgHex = tokens[fg];
  const bgHex = tokens[bg];
  if (!fgHex || !bgHex) {
    console.error(`Missing token: ${!fgHex ? fg : bg}`);
    process.exit(1);
  }
  const ratio = contrast(fgHex, bgHex);
  const pass = min === null ? null : ratio >= min;
  if (pass === false) failures += 1;
  rows.push({
    pair: `${fg} on ${bg}`,
    colours: `${fgHex} / ${bgHex}`,
    ratio: `${ratio.toFixed(2)}:1`,
    required: min === null ? "report only" : `${min}:1`,
    result: pass === null ? "INFO" : pass ? "PASS" : "FAIL",
  });
}

const width = (key) =>
  Math.max(key.length, ...rows.map((row) => row[key].length));
const widths = {
  pair: width("pair"),
  colours: width("colours"),
  ratio: width("ratio"),
  required: width("required"),
  result: width("result"),
};

const line = (cells) =>
  `| ${cells.pair.padEnd(widths.pair)} | ${cells.colours.padEnd(widths.colours)} | ${cells.ratio.padStart(widths.ratio)} | ${cells.required.padEnd(widths.required)} | ${cells.result.padEnd(widths.result)} |`;

console.log(
  line({
    pair: "pair",
    colours: "colours",
    ratio: "ratio",
    required: "required",
    result: "result",
  }),
);
console.log(
  `|${"-".repeat(widths.pair + 2)}|${"-".repeat(widths.colours + 2)}|${"-".repeat(widths.ratio + 2)}|${"-".repeat(widths.required + 2)}|${"-".repeat(widths.result + 2)}|`,
);
for (const row of rows) console.log(line(row));

if (failures > 0) {
  console.error(`\n${failures} pair(s) below the required ratio.`);
  process.exit(1);
}

console.log("\nAll required contrast ratios met.");
