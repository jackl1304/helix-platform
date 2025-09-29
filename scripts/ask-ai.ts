#!/usr/bin/env tsx
import fetch from 'node-fetch';

async function main() {
  const question = process.argv.slice(2).join(' ') || 'Was ist der aktuelle Datenstand?';
  const provider = process.env.AI_PROVIDER || 'perplexity';
  const url = process.env.AI_ENDPOINT || 'http://localhost:3000/api/ai/ask';

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, provider })
  });

  const text = await res.text();
  console.log(text);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


