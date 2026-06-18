const OPENROUTER_BASE = "https://openrouter.ai/api/v1"
const EMBEDDING_MODEL = "openai/text-embedding-3-small"

export async function generateEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.AI_API_KEY
  if (!apiKey) throw new Error("AI_API_KEY not set")

  const res = await fetch(`${OPENROUTER_BASE}/embeddings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: EMBEDDING_MODEL,
      input: text,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`OpenRouter embedding error ${res.status}: ${err}`)
  }

  const data = await res.json()
  return data.data[0].embedding
}

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const apiKey = process.env.AI_API_KEY
  if (!apiKey) throw new Error("AI_API_KEY not set")

  const res = await fetch(`${OPENROUTER_BASE}/embeddings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: EMBEDDING_MODEL,
      input: texts,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`OpenRouter batch embedding error ${res.status}: ${err}`)
  }

  const data = await res.json()
  return data.data.map((d: any) => d.embedding)
}

export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0, na = 0, nb = 0
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]
    na += a[i] * a[i]
    nb += b[i] * b[i]
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb))
}
