import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, 'backend/.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eq = trimmed.indexOf('=');
  if (eq !== -1) {
    envVars[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
  }
}

const apiKey = envVars.AI_API_KEY;
const currentModel = envVars.AI_MODEL || 'gemini-2.5-flash';

async function testModel(model) {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(20000),
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: 'Hello, reply with only the word SUCCESS' }] }]
      })
    });
    const data = await res.json();
    if (res.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
      console.log(`MODEL ${model}: SUCCESS ->`, data.candidates[0].content.parts[0].text.trim());
      return true;
    } else {
      console.log(`MODEL ${model}: FAILED ->`, data.error?.message || data.error?.status || `HTTP ${res.status}`);
      return false;
    }
  } catch (err) {
    console.log(`MODEL ${model}: FAILED ->`, err.message);
    return false;
  }
}

async function run() {
  console.log("==========================================");
  console.log("TESTING GEMINI MODELS ON CONFIGURED KEY");
  console.log("==========================================");
  console.log(`Configured Model in .env: ${currentModel}`);
  const ok = await testModel(currentModel);
  if (!ok) {
    console.log(`\nTesting active supported models on key:`);
    await testModel('gemini-3.5-flash');
    await testModel('gemini-3.1-flash-lite');
  }
}

run();
