import type { Config } from "../config";

export type ArenaCategory = "ai" | "crypto" | "politics" | "meme" | "other";

interface ClassifyItem {
  id: string;
  handle: string;
  text: string;
}

interface LabelResponseItem {
  id: string;
  category: ArenaCategory;
}

interface LabelResponse {
  labels: LabelResponseItem[];
}

const MODEL = "gpt-4o-mini";

export async function classifyArenas(
  config: Config,
  items: ClassifyItem[],
): Promise<Record<string, ArenaCategory>> {
  if (!config.openAiApiKey) return {};
  if (!items.length) return {};

  const systemPrompt =
    "You are classifying viral tweets into coarse buckets for a prediction market. " +
    "Return STRICT JSON only, no prose.\n" +
    'Valid categories: "crypto", "ai", "politics", "meme", "other".\n' +
    "- crypto: anything clearly about coins, tokens, DeFi, NFTs, airdrops, Base, onchain, CT culture.\n" +
    "- ai: AI, LLMs, dev tools, startups, hardware, general tech topics.\n" +
    "- politics: elections, geopolitics, public policy, politicians, governments.\n" +
    "- meme: mostly jokes / shitposts / culture, not clearly crypto/ai/politics.\n" +
    "- other: everything else.\n" +
    "Respond with a JSON object: { \"labels\": [{ \"id\": \"arena-id\", \"category\": \"crypto\" }, ...] }.";

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.openAiApiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: JSON.stringify({
              arenas: items,
            }),
          },
        ],
      }),
    });

    if (!res.ok) {
      // eslint-disable-next-line no-console
      console.error("[labeling] OpenAI classification failed", res.status, res.statusText);
      return {};
    }

    const json = (await res.json()) as any;
    const content: string | undefined =
      json.choices?.[0]?.message?.content ?? json.choices?.[0]?.message?.content?.[0]?.text;

    if (!content) {
      // eslint-disable-next-line no-console
      console.error("[labeling] OpenAI classification missing content");
      return {};
    }

    let parsed: LabelResponse | null = null;
    try {
      parsed = JSON.parse(content) as LabelResponse;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("[labeling] Failed to parse OpenAI JSON response", e, content);
      return {};
    }

    if (!parsed.labels || !Array.isArray(parsed.labels)) {
      // eslint-disable-next-line no-console
      console.error("[labeling] Parsed response missing labels array", parsed);
      return {};
    }

    const map: Record<string, ArenaCategory> = {};
    for (const item of parsed.labels) {
      if (!item.id || !item.category) continue;
      map[item.id] = item.category;
    }
    return map;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("[labeling] OpenAI request failed", e);
    return {};
  }
}

