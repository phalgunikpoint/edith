# Prompt Enhancer — Project README

## Task

**Build a Prompt Enhancer Application for Vercel Deployment**

### Overview

Create a single-page application that enhances user prompts using the OpenAI API via Vercel serverless functions.

**Technical Requirements**

* Simple HTML/CSS/JS frontend
* Vercel serverless functions for API calls
* No separate backend needed
* Responsive design

---

## Project Structure

```
prompt-enhancer/
├── api/
│   └── enhancePrompt.js
├── css/
│   └── style.css
├── js/
│   └── script.js
├── index.html
├── vercel.json
└── package.json
```

---

## 1. Create HTML Structure (`index.html`)

Basic single-page layout with an input area, controls for style/creativity, and a result display. Include CSS and JS files and a loading indicator.

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Prompt Enhancer</title>
  <link rel="stylesheet" href="/css/style.css">
</head>
<body>
  <main class="container">
    <h1>Prompt Enhancer</h1>

    <section class="card">
      <label for="prompt">Enter prompt</label>
      <textarea id="prompt" placeholder="Write your prompt here..."></textarea>

      <div class="controls">
        <select id="style">
          <option value="concise">Concise</option>
          <option value="creative">Creative</option>
          <option value="technical">Technical</option>
        </select>

        <input type="range" id="creativity" min="0" max="10" value="5">
        <button id="enhance">Enhance</button>
      </div>

      <div id="loader" class="hidden">Enhancing…</div>

      <h2>Enhanced Prompt</h2>
      <pre id="result" class="result"></pre>
      <button id="copyBtn">Copy</button>
    </section>
  </main>

  <script src="/js/script.js"></script>
</body>
</html>
```

---

## 2. Style the Application (`css/style.css`)

Modern, clean, responsive styles with visual feedback.

```css
/* css/style.css */
:root{--bg:#f7f7fb;--card:#fff;--accent:#5b6cff}
*{box-sizing:border-box}
body{font-family:Inter,system-ui,Segoe UI,Roboto,Helvetica,Arial,sans-serif;background:var(--bg);margin:0;padding:24px;color:#111}
.container{max-width:900px;margin:0 auto}
.card{background:var(--card);padding:20px;border-radius:12px;box-shadow:0 6px 18px rgba(20,20,50,.06)}
textarea{width:100%;min-height:120px;padding:12px;border-radius:8px;border:1px solid #e6e9f2}
.controls{display:flex;gap:12px;align-items:center;margin-top:12px}
button{background:var(--accent);color:#fff;border:0;padding:10px 14px;border-radius:8px;cursor:pointer}
.result{white-space:pre-wrap;background:#f4f6ff;padding:12px;border-radius:8px;border:1px solid #e6e9f2}
.hidden{display:none}
@media (max-width:640px){.controls{flex-direction:column;align-items:stretch}}
```

---

## 3. Implement Frontend Logic (`js/script.js`)

Handles form submission, calls the serverless function, shows loading state, displays the enhanced prompt, and supports copy-to-clipboard.

```javascript
// js/script.js
const promptEl = document.getElementById('prompt');
const styleEl = document.getElementById('style');
const creativityEl = document.getElementById('creativity');
const enhanceBtn = document.getElementById('enhance');
const resultEl = document.getElementById('result');
const loader = document.getElementById('loader');
const copyBtn = document.getElementById('copyBtn');

async function enhancePrompt() {
  const prompt = promptEl.value.trim();
  if (!prompt) return alert('Please enter a prompt.');

  loader.classList.remove('hidden');
  enhanceBtn.disabled = true;

  try {
    const res = await fetch('/api/enhancePrompt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        style: styleEl.value,
        creativity: Number(creativityEl.value)
      })
    });

    const data = await res.json();
    if (res.ok) {
      resultEl.textContent = data.enhancedPrompt || 'No result';
    } else {
      resultEl.textContent = data.error || 'Failed to enhance prompt';
    }
  } catch (err) {
    resultEl.textContent = 'Network error';
  } finally {
    loader.classList.add('hidden');
    enhanceBtn.disabled = false;
  }
}

enhanceBtn.addEventListener('click', enhancePrompt);
copyBtn.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(resultEl.textContent || '');
    copyBtn.textContent = 'Copied!';
    setTimeout(() => (copyBtn.textContent = 'Copy'), 1500);
  } catch (err) {
    copyBtn.textContent = 'Failed';
  }
});
```

---

## 4. Serverless Function (`api/enhancePrompt.js`)

Handles POST requests, calls the OpenAI API, and returns only the enhanced prompt.

```javascript
// api/enhancePrompt.js
const { OpenAI } = require('openai');

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, style, creativity } = req.body || {};
    if (!prompt) return res.status(400).json({ error: 'Missing prompt' });

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const enhancementInstruction = `Enhance the following prompt using ${style} style with creativity level ${creativity}/10.\nApply prompt engineering best practices to make it more effective for AI interaction.\nReturn only the enhanced prompt without any additional explanations.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: enhancementInstruction },
        { role: 'user', content: prompt }
      ],
      max_tokens: 500,
      temperature: (creativity || 5) / 10,
    });

    const enhancedPrompt = completion.choices?.[0]?.message?.content || '';
    return res.status(200).json({ enhancedPrompt });
  } catch (error) {
    console.error('Error enhancing prompt:', error);
    return res.status(500).json({ error: 'Failed to enhance prompt' });
  }
};
```

> **Note:** The above uses the `openai` npm package and `OpenAI` class. Ensure package versions match your environment; adjust usage if using different SDK versions.

---

## 5. Vercel Configuration (`vercel.json`)

Set CORS headers and a rewrite to serve `index.html` for SPA routing.

```json
{
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "*" },
        { "key": "Access-Control-Allow-Methods", "value": "GET, POST, OPTIONS" },
        { "key": "Access-Control-Allow-Headers", "value": "Content-Type" }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

## 6. `package.json`

```json
{
  "name": "prompt-enhancer",
  "version": "1.0.0",
  "description": "AI Prompt Enhancer Application",
  "scripts": {
    "dev": "vercel dev"
  },
  "dependencies": {
    "openai": "^4.20.1"
  },
  "devDependencies": {
    "vercel": "^28.4.0"
  }
}
```

---

## 7. Deployment Instructions

1. Push code to a GitHub repository
2. Connect the repository to Vercel
3. In Vercel Dashboard > Project Settings > Environment Variables, set `OPENAI_API_KEY` (your OpenAI API key)
4. Deploy the application

---

## 8. Environment Variables

* `OPENAI_API_KEY` — Your OpenAI API key (set in Vercel dashboard)

---

## 9. Testing

* Run locally with `vercel dev` and test the `/api/enhancePrompt` endpoint
* Verify the frontend sends POST requests and displays results
* Test responsiveness across device sizes

---

## 10. Notes & Security

* Never commit your `OPENAI_API_KEY` to source control. Use environment variables.
* Monitor token usage and set reasonable max\_tokens and temperature values.
* Consider rate-limiting on the serverless function or additional validation if open to public.

---

If you want, I can also:

* Provide a ready ZIP with these files,
* Convert the serverless function to another OpenAI SDK version,
* Add more frontend controls (tone presets, token limit), or
* Harden CORS and validation for production.
