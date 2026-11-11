// Runs on Netlify's server, NOT in the visitor's browser.
const MAX_SCORE = 60; // the most anyone could realistically catch in 30 seconds

function reply(statusCode, body) {
  return {
    statusCode: statusCode,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  };
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return reply(405, { error: "Method not allowed" });
  }

  let data;
  try {
    data = JSON.parse(event.body);
  } catch (e) {
    return reply(400, { error: "Invalid request" });
  }

  // Check everything. Never trust what the browser sends.
  const name = typeof data.name === "string" ? data.name.trim() : "";
  const score = data.score;

  if (name.length < 1 || name.length > 20) {
    return reply(400, { error: "Name must be 1 to 20 characters" });
  }
  if (!Number.isInteger(score) || score < 1 || score > MAX_SCORE) {
    return reply(400, { error: "Invalid score" });
  }

  // Save to Supabase using the secret key (kept safe in Netlify, never in the code)
  const res = await fetch(process.env.SUPABASE_URL + "/rest/v1/scores", {
    method: "POST",
    headers: {
      apikey: process.env.SUPABASE_SERVICE_KEY,
      "Content-Type": "application/json",
      Prefer: "return=minimal"
    },
    body: JSON.stringify({ player_name: name, score: score })
  });

  if (!res.ok) {
    console.error("Supabase error:", res.status, await res.text());
    return reply(500, { error: "Could not save score" });
  }
  return reply(200, { ok: true });
};
