# Pest Control VA – "Talk to Emma" demo page

A one-page site with a **Talk to Emma** button. Visitors talk to the Retell voice agent
"Emma – Alternative Pest & Termite Control" right in their browser.

## Files

- `index.html` – the demo page (no build step)
- `api/create-web-call.js` – Vercel serverless function that starts a Retell web call.
  Your Retell API key stays on the server and is never sent to the browser.
- `package.json` – tells Vercel to use modern JavaScript (ES modules)

## Deploy to Vercel

1. Push this folder to a new GitHub repository.
2. In Vercel: **Add New → Project → Import** that repository.
   - Framework preset: **Other**
   - Leave the build and output settings empty
3. Before you click Deploy, open **Environment Variables** and add:
   - `RETELL_API_KEY` = your Retell API key (Retell dashboard → Settings → API Keys)
   - Optional: `RETELL_AGENT_ID` = a different agent ID. The default is Emma:
     `agent_13abac2ff0386afb3869164b65`
4. Click **Deploy**, open the URL, click **Talk to Emma** and allow the microphone.

If you add or change an environment variable after deploying, redeploy it:
**Deployments → ⋯ → Redeploy**.

## Notes

- Every demo call uses Retell minutes on your account. The function allows about
  6 calls per visitor per hour as basic protection.
- Bookings made during demo calls go to your Cal.com demo calendar, so cancel test bookings afterwards.
- Test locally with `npx vercel dev`, with `RETELL_API_KEY` in a `.env` file. Never commit `.env`.
