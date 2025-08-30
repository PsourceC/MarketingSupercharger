// Netlify Scheduled Function: triggers the app's unified refresh orchestrator
// Runs on a safe cadence; the orchestrator enforces per-source limits

exports.config = {
  // Run hourly; orchestrator will skip if data is fresh
  schedule: "0 * * * *",
}

async function postJSON(url, body, timeoutMs = 20000) {
  const controller = new AbortController()
  const t = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body || {}),
      signal: controller.signal,
    })
    const text = await res.text()
    let data
    try { data = JSON.parse(text) } catch { data = text }
    return { ok: res.ok, status: res.status, data }
  } finally {
    clearTimeout(t)
  }
}

exports.handler = async () => {
  // Prefer Netlify-provided URL; fallback to custom env; local for dev
  const base = process.env.URL || process.env.DEPLOY_PRIME_URL || process.env.APP_BASE_URL || 'http://localhost:3000'
  const target = `${base.replace(/\/$/, '')}/api/refresh`

  // Call orchestrator; it decides which sources to refresh based on recency
  const result = await postJSON(target, {})

  if (!result.ok) {
    return {
      statusCode: 502,
      body: JSON.stringify({ success: false, target, status: result.status, data: result.data })
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ success: true, target, result: result.data })
  }
}
