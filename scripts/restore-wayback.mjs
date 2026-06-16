import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, extname, join, normalize, relative } from "node:path";

const DOMAIN = "vgmapper.com";
const SITE_URL = `https://${DOMAIN}`;
const GENERATED_DATE = "2026-06-16";
const FROM = "2007";
const TO = "20121231235959";
const ROOT = new URL("../", import.meta.url);
const ARCHIVE_DIR = new URL("../archive/", import.meta.url);
const USER_AGENT =
  "Mozilla/5.0 (compatible; VGMapperStaticRestore/1.0; +https://vgmapper.com/)";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function htmlEscape(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function csvEscape(value) {
  const text = String(value ?? "");
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function toCsv(rows, headers) {
  return [
    headers.map(csvEscape).join(","),
    ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(",")),
  ].join("\n") + "\n";
}

function safeOutputPath(urlPath) {
  const cleanPath = decodeURIComponent(urlPath).replace(/^\/+/, "");
  if (!cleanPath || cleanPath === "/") {
    return "index.html";
  }

  const normalized = normalize(cleanPath || "index.html");
  if (normalized.startsWith("..") || normalized.includes("/../")) {
    throw new Error(`Unsafe output path: ${urlPath}`);
  }

  if (urlPath.endsWith("/")) {
    return join(normalized, "index.html");
  }

  return normalized;
}

function normalizeInternalUrl(original) {
  let url;
  try {
    url = new URL(original);
  } catch {
    return null;
  }

  const hostname = url.hostname.replace(/^www\./, "").toLowerCase();
  if (hostname !== DOMAIN) return null;

  const pathname = decodeURIComponent(url.pathname || "/");
  return {
    original,
    normalizedPath: pathname || "/",
    search: url.search,
    absolute: `http://${DOMAIN}${pathname || "/"}${url.search}`,
  };
}

async function fetchWithRetry(url, options = {}, retries = 3) {
  let lastError;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), options.timeout ?? 90_000);

    try {
      const response = await fetch(url, {
        headers: {
          "user-agent": USER_AGENT,
          accept: options.accept ?? "*/*",
        },
        signal: controller.signal,
      });
      const body = await response.arrayBuffer();

      if (!response.ok) {
        const preview = new TextDecoder("utf-8", { fatal: false }).decode(body).slice(0, 120);
        throw new Error(`HTTP ${response.status}: ${preview.replace(/\s+/g, " ")}`);
      }

      return { response, body };
    } catch (error) {
      lastError = error;
      if (attempt < retries) {
        await sleep(1000 * (attempt + 1));
      }
    } finally {
      clearTimeout(timeout);
    }
  }

  throw lastError;
}

async function fetchCdx(params) {
  const endpoint = new URL("https://web.archive.org/cdx");
  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) {
      for (const item of value) endpoint.searchParams.append(key, item);
    } else {
      endpoint.searchParams.set(key, value);
    }
  }

  const { body } = await fetchWithRetry(endpoint, {
    accept: "application/json",
    timeout: 120_000,
  });
  const text = new TextDecoder("utf-8", { fatal: false }).decode(body);
  if (text.trim().startsWith("<")) {
    throw new Error(`CDX returned HTML: ${text.slice(0, 120).replace(/\s+/g, " ")}`);
  }

  const json = JSON.parse(text);
  return Array.isArray(json) ? json.slice(1) : [];
}

function latestByPath(rows, { includeSearch = false } = {}) {
  const records = new Map();

  for (const row of rows) {
    const [timestamp, original, statuscode, mimetype, length, digest] = row;
    const normalized = normalizeInternalUrl(original);
    if (!normalized) continue;
    if (!includeSearch && normalized.search) continue;

    const path = normalized.normalizedPath || "/";
    if (path.includes("\0")) continue;
    if (path.startsWith("/cgi-sys/")) continue;
    if (path.startsWith("/RequestForms/do_")) continue;

    const existing = records.get(path);
    if (!existing || timestamp > existing.timestamp) {
      records.set(path, {
        timestamp,
        original,
        statuscode,
        mimetype,
        length: Number(length || 0),
        digest,
        path,
        outputPath: safeOutputPath(path),
      });
    }
  }

  return [...records.values()].sort((a, b) => a.path.localeCompare(b.path, "en"));
}

function waybackRawUrl(record, original = record.original) {
  return `https://web.archive.org/web/${record.timestamp}id_/${original}`;
}

function cleanHtml(html) {
  return html
    .replace(/<script[^>]*src=["']?https?:\/\/web-static\.archive\.org[\s\S]*?<\/script>/gi, "")
    .replace(/<link[^>]+href=["']?https?:\/\/web-static\.archive\.org[^>]*>/gi, "")
    .replace(/<div\s+id=["']wm-ipp[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/gi, "")
    .replace(/<div\s+id=["']urlss-[^"']+["'][\s\S]*?<script>document\.getElementById\(["']urlss-[^"']+["']\)\.style\.display=["']none["']<\/script>/gi, "")
    .replace(/<script>document\.getElementById\(["']urlss-[^"']+["']\)\.style\.display=["']none["']<\/script>/gi, "")
    .replace(/<meta\s+http-equiv=["']Content-Type["'][^>]*charset=iso-8859-1[^>]*>/gi, '<meta charset="utf-8">')
    .replace(/charset=iso-8859-1/gi, "charset=utf-8");
}

function archiveUrlForResolved(resolvedUrl, sourceRecord, pagePaths, assetPaths) {
  const normalized = normalizeInternalUrl(resolvedUrl.href);
  if (!normalized) return resolvedUrl.href;

  const path = normalized.normalizedPath || "/";
  if (!normalized.search && pagePaths.has(path)) return path;
  if (!normalized.search && assetPaths.has(path)) return path;

  return `https://web.archive.org/web/${sourceRecord.timestamp}id_/${resolvedUrl.href}`;
}

function rewriteHtmlLinks(html, sourceRecord, pagePaths, assetPaths) {
  return html.replace(/\b(href|src)=["']([^"']+)["']/gi, (match, attr, value) => {
    const trimmed = value.trim();
    if (
      !trimmed ||
      trimmed.startsWith("#") ||
      trimmed.startsWith("mailto:") ||
      trimmed.startsWith("javascript:") ||
      trimmed.startsWith("data:")
    ) {
      return match;
    }

    let resolved;
    try {
      resolved = new URL(trimmed, sourceRecord.original);
    } catch {
      return match;
    }

    const rewritten = archiveUrlForResolved(resolved, sourceRecord, pagePaths, assetPaths);
    return `${attr}="${htmlEscape(rewritten)}"`;
  });
}

function pageTitle(html, path) {
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]
    ?.replace(/<[^>]+>/g, " ")
    ?.replace(/\s+/g, " ")
    ?.trim();

  if (title) return title;
  if (path === "/") return "VGMapper";

  return path
    .replace(/^\/+|\/+$/g, "")
    .replace(/\.(php|html?)$/i, "")
    .replace(/[-_/]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function buildIndex(records) {
  const groups = new Map();
  for (const record of records) {
    const first = record.path.split("/").filter(Boolean)[0] || "Home";
    const group = first.startsWith("Sys") ? "Systems" : first;
    if (!groups.has(group)) groups.set(group, []);
    groups.get(group).push(record);
  }

  const groupHtml = [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b, "en"))
    .map(([group, rows]) => {
      const links = rows
        .slice(0, 60)
        .map(
          (row) =>
            `<li><a href="${htmlEscape(row.path)}">${htmlEscape(row.title)}</a><span>${htmlEscape(row.path)}</span></li>`,
        )
        .join("\n");
      const extra =
        rows.length > 60 ? `<li class="muted">+ ${rows.length - 60} more restored pages in this section</li>` : "";
      return `<section><h2>${htmlEscape(group)}</h2><ul>${links}${extra}</ul></section>`;
    })
    .join("\n");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>VGMapper Restored Archive</title>
  <meta name="description" content="Restored static archive of VGMapper video game maps and media pages.">
  <link rel="canonical" href="${SITE_URL}/archive/">
  <style>
    body { margin: 0; font-family: Tahoma, Arial, sans-serif; background: #f5f5f5; color: #1f1f1f; }
    header { padding: 28px 24px 18px; background: #ffffff; border-bottom: 1px solid #d8d8d8; }
    main { max-width: 980px; margin: 0 auto; padding: 24px; }
    h1 { margin: 0 0 8px; font-size: 30px; }
    h2 { font-size: 18px; margin: 26px 0 10px; }
    p { margin: 0; line-height: 1.5; }
    section { background: #fff; border: 1px solid #ddd; border-radius: 6px; padding: 14px 16px; margin: 14px 0; }
    ul { margin: 0; padding-left: 18px; columns: 2; column-gap: 28px; }
    li { break-inside: avoid; margin: 0 0 7px; line-height: 1.25; }
    li span { display: block; color: #666; font-size: 11px; }
    a { color: #164f9e; }
    .muted { color: #666; list-style: none; margin-top: 8px; }
    @media (max-width: 720px) { ul { columns: 1; } main { padding: 16px; } }
  </style>
</head>
<body>
  <header>
    <h1>VGMapper Restored Archive</h1>
    <p>${records.length} archived HTML pages restored from public Wayback captures dated before 2013.</p>
  </header>
  <main>${groupHtml}</main>
</body>
</html>
`;
}

function build404() {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Page not found | VGMapper</title>
  <style>
    body { font-family: Tahoma, Arial, sans-serif; margin: 40px; color: #1f1f1f; }
    a { color: #164f9e; }
  </style>
</head>
<body>
  <h1>Page not found</h1>
  <p>The restored VGMapper archive is available from the <a href="/">home page</a> and <a href="/archive/">archive index</a>.</p>
</body>
</html>
`;
}

function buildSitemap(records) {
  const urls = ["/", "/archive/", ...records.map((record) => record.path)]
    .filter((path, index, array) => array.indexOf(path) === index)
    .map((path) => {
      const loc = `${SITE_URL}${path === "/" ? "/" : encodeURI(path)}`;
      return `  <url>\n    <loc>${htmlEscape(loc)}</loc>\n  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

function buildReport(pageRecords, assetRecords, failures) {
  const bySection = new Map();
  for (const record of pageRecords) {
    const section = record.path.split("/").filter(Boolean)[0] || "home";
    bySection.set(section, (bySection.get(section) || 0) + 1);
  }

  const sectionRows = [...bySection.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "en"))
    .map(([section, count]) => `| ${section} | ${count} |`)
    .join("\n");

  const failureText = failures.length
    ? `\n## Failures\n\n${failures.map((failure) => `- ${failure}`).join("\n")}\n`
    : "";

  return `# VGMapper Wayback Restore

Generated: ${GENERATED_DATE}

## Scope

- Domain: ${DOMAIN}
- Capture range: ${FROM} through ${TO}
- Restored HTML pages: ${pageRecords.length}
- Restored local assets: ${assetRecords.length}
- Runtime: static files only

The restore intentionally excludes post-2013 parking pages, Wayback query spam, executable form handlers, and bulk game-map PNG downloads. Non-local map/media links in restored HTML point to raw Wayback captures.

## Restored Sections

| Section | Pages |
| --- | --- |
${sectionRows}
${failureText}`;
}

async function restorePages(pageRecords, assetPaths) {
  const pagePaths = new Set(pageRecords.map((record) => record.path));
  const restored = [];
  const failures = [];
  const decoder = new TextDecoder("windows-1252", { fatal: false });

  for (let index = 0; index < pageRecords.length; index += 1) {
    const record = pageRecords[index];
    const url = waybackRawUrl(record);

    try {
      const { body } = await fetchWithRetry(url, { accept: "text/html", timeout: 60_000 }, 2);
      const rawHtml = decoder.decode(body);
      const cleaned = cleanHtml(rawHtml);
      const rewritten = rewriteHtmlLinks(cleaned, record, pagePaths, assetPaths);
      const target = new URL(record.outputPath, ROOT);

      await mkdir(dirname(target.pathname), { recursive: true });
      await writeFile(target, rewritten);

      record.title = pageTitle(rewritten, record.path);
      restored.push(record);
    } catch (error) {
      failures.push(`${record.path}: ${error.message}`);
    }

    if ((index + 1) % 50 === 0 || index + 1 === pageRecords.length) {
      console.log(`pages ${index + 1}/${pageRecords.length}`);
    }

    await sleep(90);
  }

  return { restored, failures };
}

async function restoreAssets(assetRecords) {
  const restored = [];
  const failures = [];

  for (let index = 0; index < assetRecords.length; index += 1) {
    const record = assetRecords[index];
    const url = waybackRawUrl(record);
    const target = new URL(record.outputPath, ROOT);

    try {
      const { body } = await fetchWithRetry(url, { timeout: 60_000 }, 2);
      const bytes = Buffer.from(body);
      if (bytes.slice(0, 20).toString("utf8").includes("<!DOCTYPE") || bytes.slice(0, 20).toString("utf8").includes("<html")) {
        throw new Error("Wayback returned HTML instead of an asset");
      }

      await mkdir(dirname(target.pathname), { recursive: true });
      await writeFile(target, bytes);
      restored.push(record);
    } catch (error) {
      failures.push(`${record.path}: ${error.message}`);
    }

    if ((index + 1) % 50 === 0 || index + 1 === assetRecords.length) {
      console.log(`assets ${index + 1}/${assetRecords.length}`);
    }

    await sleep(60);
  }

  return { restored, failures };
}

async function writeStaticFiles(pageRecords, assetRecords, failures) {
  const rootFiles = [
    "404.html",
    "_headers",
    "robots.txt",
    "sitemap.xml",
    "README.md",
  ];

  await writeFile(new URL("archive/index.html", ROOT), buildIndex(pageRecords));
  await writeFile(new URL("404.html", ROOT), build404());
  await writeFile(
    new URL("robots.txt", ROOT),
    `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`,
  );
  await writeFile(new URL("sitemap.xml", ROOT), buildSitemap(pageRecords));
  await writeFile(
    new URL("_headers", ROOT),
    `/*.php\n  Content-Type: text/html; charset=utf-8\n/**/*.php\n  Content-Type: text/html; charset=utf-8\n/archive/*\n  X-Robots-Tag: noindex\n/scripts/*\n  X-Robots-Tag: noindex, nofollow\n`,
  );
  await writeFile(
    new URL("README.md", ROOT),
    `# VGMapper\n\nStatic Cloudflare Pages restore for \`${DOMAIN}\`.\n\n## Deploy\n\n- Build command: none\n- Output directory: \`/\`\n- Runtime: static files only\n\nDo not add Cloudflare Workers, Pages Functions, \`_worker.js\`, \`functions/\`, or \`wrangler.toml\` to this repository.\n\nThe historical pages were restored from public Wayback captures before 2013. Update by committing and pushing this repository; Cloudflare Pages should be connected through Git.\n`,
  );
  await writeFile(new URL("archive/restore-report.md", ROOT), buildReport(pageRecords, assetRecords, failures));
  await writeFile(new URL("archive/restored-pages.json", ROOT), JSON.stringify(pageRecords, null, 2) + "\n");
  await writeFile(new URL("archive/restored-assets.json", ROOT), JSON.stringify(assetRecords, null, 2) + "\n");
  await writeFile(
    new URL("archive/restored-pages.csv", ROOT),
    toCsv(pageRecords, ["path", "outputPath", "timestamp", "original", "title", "length", "digest"]),
  );

  for (const file of rootFiles) {
    const path = new URL(file, ROOT).pathname;
    const rel = relative(new URL(".", ROOT).pathname, path);
    if (rel.startsWith("..")) throw new Error(`Unexpected static file path: ${file}`);
  }
}

async function main() {
  await mkdir(ARCHIVE_DIR, { recursive: true });

  for (const entry of await readFile(new URL("README.md", ROOT)).then(() => []).catch(() => [])) {
    void entry;
  }

  console.log("Fetching HTML CDX inventory");
  const htmlRows = await fetchCdx({
    url: `*.${DOMAIN}/*`,
    output: "json",
    fl: "timestamp,original,statuscode,mimetype,length,digest",
    filter: ["statuscode:200", "mimetype:text/html"],
    from: FROM,
    to: TO,
    limit: "100000",
  });
  const pageRecords = latestByPath(htmlRows).filter((record) => {
    if (record.path.startsWith("/Images/")) return false;
    if (record.path.startsWith("/css/")) return false;
    return [".php", ".html", ".htm", ""].includes(extname(record.path).toLowerCase()) || record.path.endsWith("/");
  });

  console.log("Fetching image CDX inventory");
  const imageRows = await fetchCdx({
    url: `${DOMAIN}/Images/*`,
    output: "json",
    fl: "timestamp,original,statuscode,mimetype,length,digest",
    filter: ["statuscode:200"],
    from: FROM,
    to: TO,
    limit: "20000",
  });
  const assetRecords = latestByPath(imageRows).filter((record) =>
    [".png", ".jpg", ".jpeg", ".gif"].includes(extname(record.path).toLowerCase()),
  );
  const assetPaths = new Set(assetRecords.map((record) => record.path));

  console.log(`Restoring ${pageRecords.length} HTML pages and ${assetRecords.length} assets`);
  await rm(new URL("archive/index.html", ROOT), { force: true });

  const assets = await restoreAssets(assetRecords);
  const pages = await restorePages(pageRecords, new Set(assets.restored.map((record) => record.path)));
  const failures = [...assets.failures, ...pages.failures];

  await writeStaticFiles(pages.restored, assets.restored, failures);
  console.log(`Restored ${pages.restored.length} pages, ${assets.restored.length} assets, ${failures.length} failures`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
