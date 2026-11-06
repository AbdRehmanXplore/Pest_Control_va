// Vercel serverless function: creates a Retell web call and returns the
// short-lived access token to the browser. The Retell API key stays on the
// server (set RETELL_API_KEY in Vercel > Settings > Environment Variables).

const DEFAULT_AGENT_ID = "agent_13abac2ff0386afb3869164b65"; // Emma - Alternative Pest & Termite Control

// Very small in-memory rate limit per IP (resets when the function cold-starts).
const hits = new Map();
const LIMIT = 6; // calls
const WINDOW_MS = 60 * 60 * 1000; // per hour

function rateLimited(ip) {
  const now = Date.now();
  const list = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  if (list.length >= LIMIT) {
    hits.set(ip, list);
    return true;
  }
  list.push(now);
  hits.set(ip, list);
  return false;
}

async function createCall(path, apiKey, agentId) {
  return fetch(`https://api.retellai.com${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ agent_id: agentId }),
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.RETELL_API_KEY;
  const agentId = process.env.RETELL_AGENT_ID || DEFAULT_AGENT_ID;

  if (!apiKey) {
    return res
      .status(500)
      .json({ error: "Demo is not configured yet (missing RETELL_API_KEY)." });
  }

  const ip =
    (req.headers["x-forwarded-for"] || "").split(",")[0].trim() ||
    req.socket?.remoteAddress ||
    "unknown";
  if (rateLimited(ip)) {
    return res
      .status(429)
      .json({ error: "Too many demo calls. Please try again in a little while." });
  }

  try {
    // Try the v2 endpoint first, fall back to v3 if it isn't available.
    let r = await createCall("/v2/create-web-call", apiKey, agentId);
    if (r.status === 404) {
      r = await createCall("/v3/create-web-call", apiKey, agentId);
    }

    const data = await r.json().catch(() => ({}));

    if (!r.ok || !data.access_token) {
      console.error("Retell create-web-call failed", r.status, data);
      return res.status(502).json({ error: "Could not start the call. Please try again." });
    }

    return res.status(200).json({
      access_token: data.access_token,
      call_id: data.call_id,
    });
  } catch (err) {
    console.error("Retell create-web-call error", err);
    return res.status(500).json({ error: "Could not start the call. Please try again." });
  }
}
