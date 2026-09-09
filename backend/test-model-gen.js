import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.AI_API_KEY;

async function testModel(model) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: 'Hello, reply with only the word SUCCESS' }] }]
    })
  });
  const data = await res.json();
  if (res.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
    console.log(`MODEL ${model}: SUCCESS ->`, data.candidates[0].content.parts[0].text.trim());
    return true;
  } else {
    console.log(`MODEL ${model}: FAILED ->`, data.error?.message?.slice(0, 100));
    return false;
  }
}

async function run() {
  await testModel('gemini-2.5-flash');
  await testModel('gemini-3.6-flash');
  await testModel('gemini-flash-latest');
  await testModel('gemini-2.5-flash-lite');
}

run();
