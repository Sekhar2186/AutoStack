/**
 * Robust JSON extraction and parsing utilities for AI-generated responses.
 */

/**
 * Extracts the outermost JSON object or array from a string.
 */
export function extractJSON(text: string): string | null {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");

  const arrStart = text.indexOf("[");
  const arrEnd = text.lastIndexOf("]");

  let first = -1;
  let last = -1;

  if (start !== -1 && (arrStart === -1 || start < arrStart)) {
    first = start;
    last = end;
  } else if (arrStart !== -1) {
    first = arrStart;
    last = arrEnd;
  }

  if (first === -1 || last === -1) return null;
  return text.slice(first, last + 1);
}

/**
 * Attempts to repair truncated JSON by balancing braces and brackets.
 */
export function fixTruncatedJSON(jsonString: string): string {
  let openBraces = 0;
  let openBrackets = 0;
  let inString = false;
  let escaped = false;

  for (let i = 0; i < jsonString.length; i++) {
    const char = jsonString[i];

    if (escaped) {
      escaped = false;
      continue;
    }

    if (char === "\\") {
      escaped = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      continue;
    }

    if (!inString) {
      if (char === "{") openBraces++;
      if (char === "}") openBraces--;
      if (char === "[") openBrackets++;
      if (char === "]") openBrackets--;
    }
  }

  let repaired = jsonString;

  // If we are inside a string when it ends, close the string
  if (inString) {
    repaired += '"';
  }

  // Close open braces
  while (openBraces > 0) {
    repaired += "}";
    openBraces--;
  }

  // Close open brackets
  while (openBrackets > 0) {
    repaired += "]";
    openBrackets--;
  }

  return repaired;
}

/**
 * Sanitizes common LLM JSON glitches.
 */
export function sanitizeJSONString(jsonString: string): string {
  return jsonString
    .replace(/\\'/g, "'") // Fix invalid escaped single quotes
    .replace(/\\(?!["\\/bfnrtu])/g, "\\\\") // Double escape unknown escape sequences
    .replace(/[\u0000-\u001F]+/g, ""); // Remove control characters
}

/**
 * Orchestrates extraction, sanitization, and parsing.
 */
export function safeJsonParse<T = any>(text: string): T {
  if (!text) throw new Error("Empty input for safeJsonParse");

  // Step 1: Remove markdown noise
  const noMarkdown = text.replace(/```json/g, "").replace(/```/g, "").trim();

  // Step 2: Extract JSON structure
  let extracted = extractJSON(noMarkdown);
  if (!extracted) {
    // If no braces found, maybe it's just raw JSON text?
    extracted = noMarkdown;
  }

  // Step 3: Fix truncation
  let processed = fixTruncatedJSON(extracted);

  // Step 4: Sanitize
  processed = sanitizeJSONString(processed);

  try {
    return JSON.parse(processed) as T;
  } catch (error) {
    // Last ditch effort: if it failed, maybe it's because of unescaped newlines in strings?
    // This is VERY aggressive and might break things, but let's try it for some cases.
    try {
      // Try to replace literal newlines with \n if they are inside what looks like a string
      const fixNewlines = processed.replace(
        /(?<=: \")([\s\S]*?)(?=\",?|$)/g,
        (match) => match.replace(/\n/g, "\\n").replace(/\r/g, "\\r")
      );
      return JSON.parse(fixNewlines) as T;
    } catch (innerError) {
      console.error("JSON parse failed even after recovery attempts.");
      console.error("Processed string snippet:", processed.slice(0, 500));
      throw error;
    }
  }
}
