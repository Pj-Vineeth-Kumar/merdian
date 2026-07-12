/**
 * Cheap, deterministic repair for the common ways a model wraps or dirties JSON,
 * BEFORE we hand it to JSON.parse. This is not a full JSON5 parser — it fixes the
 * frequent, safe cases (code fences, surrounding prose, trailing commas) and
 * leaves genuinely broken output to fail cleanly at parse time.
 */
export function repairJsonText(raw: string): string {
  let text = raw.trim();

  // 1. Strip Markdown code fences: ```json ... ``` or ``` ... ```
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fence?.[1]) {
    text = fence[1].trim();
  }

  // 2. Slice to the outermost JSON object/array if the model added prose around it.
  const objStart = text.indexOf("{");
  const arrStart = text.indexOf("[");
  const start =
    objStart === -1 ? arrStart : arrStart === -1 ? objStart : Math.min(objStart, arrStart);
  const end = Math.max(text.lastIndexOf("}"), text.lastIndexOf("]"));
  if (start !== -1 && end !== -1 && end > start) {
    text = text.slice(start, end + 1);
  }

  // 3. Remove trailing commas before a closing } or ] (a very common model slip).
  text = text.replace(/,(\s*[}\]])/g, "$1");

  return text.trim();
}

/**
 * Repair, then parse. Returns `unknown` — the caller is responsible for schema
 * validation before trusting the shape. Throws on unparseable input.
 */
export function parseJsonLenient(raw: string): unknown {
  return JSON.parse(repairJsonText(raw));
}
