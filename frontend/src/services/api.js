const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8000")
  .trim()
  .replace(/\/+$/, "");

function formatDetail(detail) {
  if (Array.isArray(detail)) {
    return detail
      .map((item) => {
        const location = Array.isArray(item.loc) ? item.loc.join(" → ") : "";
        return [location, item.msg].filter(Boolean).join(": ");
      })
      .filter(Boolean)
      .join(" ");
  }

  if (typeof detail === "string") {
    return detail;
  }

  return "";
}

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, options);
  } catch {
    throw new Error(
      `Could not reach Lyftr AI at ${API_BASE_URL}. Check that the backend is running.`,
    );
  }

  const rawBody = await response.text();
  let payload = {};
  if (rawBody) {
    try {
      payload = JSON.parse(rawBody);
    } catch {
      payload = { detail: rawBody };
    }
  }

  if (!response.ok) {
    const detail = formatDetail(payload.detail || payload.message);
    const fallback =
      response.status === 422
        ? "The request was not accepted. Check your message and settings."
        : response.status === 503
          ? "The AI provider is temporarily unavailable. Please try again."
          : `The request failed (${response.status}). Please try again.`;
    throw new Error(detail || fallback);
  }

  return payload;
}

export function getHealth() {
  return request("/health");
}

export function sendChatMessage({ sessionId, message, systemPrompt, simulateFailure }) {
  const headers = { "Content-Type": "application/json" };
  if (simulateFailure.trim()) {
    headers["X-Simulate-Failure"] = simulateFailure.trim();
  }

  const body = {
    session_id: sessionId,
    message,
  };
  if (systemPrompt.trim()) {
    body.system_prompt = systemPrompt.trim();
  }

  return request("/chat", {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
}
