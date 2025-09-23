// Store multiple HuggingFace tokens in an array
const hfTokens = [
  process.env.HF_TOKEN_1,
  process.env.HF_TOKEN_2,
  process.env.HF_TOKEN_3,
];

// Utility: pick a random token
function getRandomToken() {
  const validTokens = hfTokens.filter(Boolean); // remove undefined
  if (validTokens.length === 0) {
    throw new Error("No HuggingFace tokens available");
  }
  const randomIndex = Math.floor(Math.random() * validTokens.length);
  return validTokens[randomIndex];
}

// Query function using built-in fetch
export async function query(data) {
  const token = getRandomToken();

  const response = await fetch("https://router.huggingface.co/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`HF API Error: ${response.status} - ${text}`);
  }

  return response.json();
}
