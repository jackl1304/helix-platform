import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const host = process.env.OLLAMA_HOST || "http://127.0.0.1:11434";
const model = process.env.TEST_GEN_MODEL || "coder16-de";

const srcPath = process.argv[2];
if (!srcPath) {
  console.error("Usage: node scripts/generate-tests.mjs <path-to-source-file>");
  process.exit(1);
}

const absSrc = path.resolve(srcPath);
const code = fs.readFileSync(absSrc, "utf8");
const rel = path.relative(process.cwd(), absSrc);
const base = path.basename(rel).replace(/\.(tsx|ts|jsx|js)$/, "");
const testDir = path.join(process.cwd(), "__tests__");
const outPath = path.join(testDir, base + ".test.ts");

const system = "Du bist ein erfahrener Test-Generator. Antworte ausschließlich auf Deutsch. Liefere direkt den vollständigen Test-Code als TypeScript für Vitest. Nutze bei React-Komponenten die Testing Library und jsdom. Keine Erklärungen, nur Code.";
const prompt = `
Erzeuge umfassende, deterministische Unit-Tests für die folgende Datei.

Dateipfad: ${rel}

Anforderungen:
- Test-Runner: Vitest
- Bei React-Komponenten: @testing-library/react + @testing-library/jest-dom
- Environment: jsdom
- Edge-Cases, Fehlerpfade, Props-Varianten, Events
- Nur Code zurückgeben, kein Fließtext

<CODE>
${code}
</CODE>
`;

const body = {
  model,
  system,
  prompt,
  stream: false
};

const res = await fetch(host + "/api/generate", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body)
});
if (!res.ok) {
  console.error("Ollama error:", await res.text());
  process.exit(1);
}
const data = await res.json();
const text = data.response || "";
await fs.promises.mkdir(testDir, { recursive: true });
fs.writeFileSync(outPath, text.trim() + "\n", "utf8");
console.log("Tests geschrieben:", path.relative(process.cwd(), outPath));
