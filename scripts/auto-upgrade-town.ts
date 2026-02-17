import { promises as fs } from "node:fs";
import path from "node:path";

const PROJECT_ROOT = process.cwd();
const SRC_DIR = path.join(PROJECT_ROOT, "src");
const ALLOWED_CONTEXT_EXT = new Set([".md", ".markdown", ".puml", ".txt"]);

type CliArgs = {
  contextFile?: string;
  changesUrl?: string;
  dryRun: boolean;
  model: string;
  maxContextChars: number;
  maxChangeChars: number;
  help?: boolean;
};

type ModelFileUpdate = {
  path: string;
  why?: string;
  content: string;
};

type ModelResponse = {
  change_log?: string;
  files: ModelFileUpdate[];
  next_evolution_hook?: string;
};

function parseArgs(argv: string[]): CliArgs {
  const result: CliArgs = {
    dryRun: false,
    model: process.env.OPENAI_CODEX_MODEL || "gpt-5-codex",
    maxContextChars: 12000,
    maxChangeChars: 12000,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = argv[i + 1];
    if (arg === "--context" || arg === "-c") {
      result.contextFile = next;
      i += 1;
      continue;
    }
    if (arg === "--changes-url" || arg === "-u") {
      result.changesUrl = next;
      i += 1;
      continue;
    }
    if (arg === "--model" || arg === "-m") {
      result.model = next;
      i += 1;
      continue;
    }
    if (arg === "--max-context-chars") {
      result.maxContextChars = Number.parseInt(next, 10);
      i += 1;
      continue;
    }
    if (arg === "--max-change-chars") {
      result.maxChangeChars = Number.parseInt(next, 10);
      i += 1;
      continue;
    }
    if (arg === "--dry-run") {
      result.dryRun = true;
      continue;
    }
    if (arg === "--help" || arg === "-h") {
      result.help = true;
      continue;
    }
  }
  return result;
}

function usage(): string {
  return [
    "Usage:",
    "  npm run auto:upgrade -- --context <file.md|file.puml> --changes-url <https://...> [--model gpt-5-codex] [--dry-run]",
    "",
    "Required env:",
    "  OPENAI_API_KEY=<your_api_key>",
    "",
    "Optional env:",
    "  OPENAI_CODEX_MODEL=gpt-5-codex",
  ].join("\n");
}

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

async function listSrcFiles(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const child = await listSrcFiles(full);
      files.push(...child);
      continue;
    }

    const ext = path.extname(entry.name).toLowerCase();
    if ([".js", ".mjs", ".cjs", ".ts", ".tsx", ".jsx", ".css", ".html", ".json"].includes(ext)) {
      files.push(full);
    }
  }
  return files;
}

function withinSrc(targetPath: string): boolean {
  const normalized = path.resolve(PROJECT_ROOT, targetPath);
  const relative = path.relative(SRC_DIR, normalized);
  return !relative.startsWith("..") && !path.isAbsolute(relative);
}

function buildPrompt({
  contextContent,
  changeText,
  srcSnapshot,
}: {
  contextContent: string;
  changeText: string;
  srcSnapshot: string;
}): string {
  return `
You are OpenAI Codex GPT-5.3 acting as the Imperial City Architect for KJ Town.

Goal:
- Transform software/business changes into visible, tangible upgrades in the 3D city located in src/.
- Think in metaphor:
  - microservice -> district/building/guild hall
  - integration -> gate, bridge, trade route
  - queue/event bus -> roads, rails, canals
  - reliability/security -> walls, watchtowers, shields
  - AI capability -> research tower, observatory, academy
- Every run is incremental and small, because changes arrive regularly.
- Keep it fancy and creative, but always practical and maintainable.

Hard constraints:
1) Only edit files under src/.
2) Preserve buildability and current architecture style.
3) Prefer simple, readable, reusable code. Avoid duplication.
4) Small, high-impact increments over sweeping rewrites.
5) Keep behavior coherent with existing Three.js scene design.

Business/Architecture context input:
"""
${contextContent}
"""

Incremental changes from public page:
"""
${changeText}
"""

Current src snapshot:
"""
${srcSnapshot}
"""

Return JSON ONLY (no markdown fence):
{
  "change_log": "short summary of what evolved in this city step",
  "files": [
    {
      "path": "src/CityBuilder.js",
      "why": "why this file changes",
      "content": "full updated file content"
    }
  ],
  "next_evolution_hook": "one sentence describing the next small empire evolution"
}

Rules for response:
- Include full content for each changed file.
- Omit unchanged files.
- Paths must be under src/.
- If changes are unclear, still make one safe incremental city improvement grounded in provided context.
`.trim();
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(usage());
    return;
  }

  if (!args.contextFile || !args.changesUrl) {
    console.error("Missing required arguments.");
    console.error(usage());
    process.exitCode = 1;
    return;
  }

  if (!process.env.OPENAI_API_KEY) {
    console.error("Missing OPENAI_API_KEY.");
    process.exitCode = 1;
    return;
  }

  const contextPath = path.resolve(PROJECT_ROOT, args.contextFile);
  const contextExt = path.extname(contextPath).toLowerCase();
  if (!ALLOWED_CONTEXT_EXT.has(contextExt)) {
    console.error(`Unsupported context file extension: ${contextExt}`);
    console.error("Use .md, .markdown, .puml, or .txt.");
    process.exitCode = 1;
    return;
  }

  const [contextRaw, pageResponse] = await Promise.all([
    fs.readFile(contextPath, "utf8"),
    fetch(args.changesUrl, {
      headers: {
        "User-Agent": "kj-town-auto-upgrade/1.0",
      },
    }),
  ]);

  if (!pageResponse.ok) {
    console.error(`Failed to fetch changes URL: ${pageResponse.status} ${pageResponse.statusText}`);
    process.exitCode = 1;
    return;
  }

  const pageHtml = await pageResponse.text();
  const contextContent = contextRaw.slice(0, args.maxContextChars);
  const changeText = stripHtml(pageHtml).slice(0, args.maxChangeChars);

  const srcFiles = await listSrcFiles(SRC_DIR);
  const srcSnapshotEntries = await Promise.all(
    srcFiles.map(async (filePath) => {
      const content = await fs.readFile(filePath, "utf8");
      const rel = path.relative(PROJECT_ROOT, filePath).replaceAll(path.sep, "/");
      return `--- FILE: ${rel}\n${content}\n--- END FILE`;
    }),
  );
  const srcSnapshot = srcSnapshotEntries.join("\n\n");
  const prompt = buildPrompt({ contextContent, changeText, srcSnapshot });

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: args.model,
      input: [
        {
          role: "user",
          content: [{ type: "input_text", text: prompt }],
        },
      ],
      reasoning: { effort: "medium" },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error(`OpenAI request failed: ${response.status} ${response.statusText}`);
    console.error(errText);
    process.exitCode = 1;
    return;
  }

  const payload = (await response.json()) as { output_text?: string };
  const modelText = payload.output_text;

  if (!modelText) {
    console.error("Model returned no text output.");
    process.exitCode = 1;
    return;
  }

  let parsed: ModelResponse;
  try {
    parsed = JSON.parse(modelText) as ModelResponse;
  } catch {
    const start = modelText.indexOf("{");
    const end = modelText.lastIndexOf("}");
    if (start >= 0 && end > start) {
      parsed = JSON.parse(modelText.slice(start, end + 1)) as ModelResponse;
    } else {
      console.error("Could not parse model JSON response.");
      console.error(modelText);
      process.exitCode = 1;
      return;
    }
  }

  if (!parsed || !Array.isArray(parsed.files)) {
    console.error("Invalid model response: missing files array.");
    process.exitCode = 1;
    return;
  }

  const validFiles = parsed.files.filter(
    (item) => item && typeof item.path === "string" && typeof item.content === "string" && withinSrc(item.path),
  );

  if (!validFiles.length) {
    console.error("No valid src file updates were returned.");
    process.exitCode = 1;
    return;
  }

  if (args.dryRun) {
    console.log(JSON.stringify({ change_log: parsed.change_log, files: validFiles, next_evolution_hook: parsed.next_evolution_hook }, null, 2));
    return;
  }

  for (const item of validFiles) {
    const outputPath = path.resolve(PROJECT_ROOT, item.path);
    await fs.writeFile(outputPath, item.content, "utf8");
  }

  console.log(`Applied ${validFiles.length} file update(s).`);
  if (parsed.change_log) {
    console.log(`Change log: ${parsed.change_log}`);
  }
  if (parsed.next_evolution_hook) {
    console.log(`Next evolution hook: ${parsed.next_evolution_hook}`);
  }
}

main().catch((err: unknown) => {
  console.error("Automation script failed.");
  console.error(err);
  process.exitCode = 1;
});
