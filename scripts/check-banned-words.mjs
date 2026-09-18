#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const ROOTS = [
  path.join(process.cwd(), "src/config"),
  path.join(process.cwd(), "src/components/site"),
  path.join(process.cwd(), "src/components/booking"),
  path.join(process.cwd(), "src/app"),
  path.join(process.cwd(), "docs"),
];

const BANNED = [
  { name: "best", re: /\bbest\b/i },
  { name: "top", re: /\btop\b/i },
  { name: "No.1", re: /no\.?\s*1/i },
  { name: "leading", re: /\bleading\b/i },
  { name: "renowned", re: /\brenowned\b/i },
  { name: "guaranteed", re: /\bguaranteed\b/i },
  { name: "painless", re: /\bpainless\b/i },
  { name: "100% success", re: /100%\s*success/i },
  { name: "success-rate", re: /success[-\s]?rate/i },
  { name: "cure", re: /\bcure\b/i },
];

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (/\.(ts|tsx|md)$/.test(entry.name)) files.push(full);
  }
  return files;
}

const files = ROOTS.flatMap((dir) => walk(dir));
const hits = [];

for (const file of files) {
  const lines = fs.readFileSync(file, "utf8").split("\n");
  lines.forEach((line, index) => {
    if (line.includes("className") || line.includes("class=") || line.includes("style={{")) {
      return;
    }
    for (const rule of BANNED) {
      if (rule.re.test(line)) {
        hits.push(`${file}:${index + 1} (${rule.name}): ${line.trim()}`);
      }
    }
  });
}

if (hits.length) {
  console.error("Banned medical-claim wording found:\n" + hits.join("\n"));
  process.exit(1);
}

console.log(`Checked ${files.length} files. No banned wording.`);
