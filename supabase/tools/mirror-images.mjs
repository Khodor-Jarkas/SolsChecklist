// Copies every catalog image (auras + achievements) from the Fandom wiki into
// your own Supabase Storage bucket and points image_url at the copy, so a
// renamed or deleted wiki file can no longer break the site.
//
// Needs your Supabase *secret* key (Dashboard → Project Settings → API Keys →
// "secret" / legacy "service_role"). Never commit it or put it in a
// NEXT_PUBLIC_ variable — pass it on the command line or in .env.local only.
//
// Run from the repo root:
//   # 1. Dry run: uploads the images and prints what would change. Nothing in
//   #    the database is touched.
//   SUPABASE_SECRET_KEY=sb_secret_... node --env-file=.env.local supabase/tools/mirror-images.mjs
//
//   # 2. Point the catalog at the copies:
//   SUPABASE_SECRET_KEY=sb_secret_... node --env-file=.env.local supabase/tools/mirror-images.mjs --apply
//
// Safe to re-run: uploads overwrite the same paths, and rows that already
// point at the bucket are skipped. Images that are gone from the wiki are
// listed at the end (fix those with tools/fix-broken-images.mjs first).
// Then hit /api/revalidate (see supabase/README.md) or wait 10 minutes.

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SECRET = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = process.env.IMAGE_BUCKET ?? "catalog-images";
const APPLY = process.argv.includes("--apply");
const TABLES = ["auras", "achievements"];

if (!SUPABASE_URL || !SECRET) {
  console.error("Need NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY.");
  process.exit(1);
}

const log = (...a) => console.error(...a);
const auth = { apikey: SECRET, Authorization: `Bearer ${SECRET}` };
const publicBase = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/`;

async function ensureBucket() {
  const res = await fetch(`${SUPABASE_URL}/storage/v1/bucket/${BUCKET}`, { headers: auth });
  if (res.ok) return;
  const create = await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
    method: "POST",
    headers: { ...auth, "Content-Type": "application/json" },
    body: JSON.stringify({ id: BUCKET, name: BUCKET, public: true }),
  });
  if (!create.ok) throw new Error(`Creating bucket ${BUCKET} failed: ${create.status} ${await create.text()}`);
  log(`Created public bucket "${BUCKET}".`);
}

async function loadRows(table) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=id,name,image_url&image_url=not.is.null&order=id`, {
    headers: auth,
  });
  if (!res.ok) throw new Error(`Loading ${table} failed: ${res.status} ${await res.text()}`);
  return res.json();
}

function slug(s) {
  return s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "item";
}

function extFor(url, contentType) {
  const fromType = { "image/gif": "gif", "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp" }[
    (contentType ?? "").split(";")[0]
  ];
  if (fromType) return fromType;
  const m = new URL(url).pathname.match(/\.(gif|png|jpe?g|webp)(?:$|\/)/i);
  return m ? m[1].toLowerCase().replace("jpeg", "jpg") : "png";
}

// "ok" + new URL, "gone" (404/410 upstream) or "error".
async function mirror(table, row) {
  let res;
  try {
    res = await fetch(row.image_url, { headers: { "User-Agent": "SolsChecklist image mirror" } });
  } catch (e) {
    return { status: "error", reason: e.message };
  }
  if (res.status === 404 || res.status === 410) return { status: "gone" };
  if (!res.ok) return { status: "error", reason: `download ${res.status}` };

  const contentType = res.headers.get("content-type") ?? "application/octet-stream";
  const path = `${table}/${row.id}-${slug(row.name)}.${extFor(row.image_url, contentType)}`;
  const up = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${path}`, {
    method: "POST",
    headers: { ...auth, "Content-Type": contentType, "x-upsert": "true", "Cache-Control": "max-age=31536000" },
    body: Buffer.from(await res.arrayBuffer()),
  });
  if (!up.ok) return { status: "error", reason: `upload ${up.status} ${await up.text()}` };
  return { status: "ok", url: publicBase + path };
}

async function updateRow(table, id, url) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
    method: "PATCH",
    headers: { ...auth, "Content-Type": "application/json", Prefer: "return=minimal" },
    body: JSON.stringify({ image_url: url }),
  });
  if (!res.ok) throw new Error(`Updating ${table} ${id} failed: ${res.status} ${await res.text()}`);
}

async function mapLimit(items, limit, fn) {
  const out = new Array(items.length);
  let i = 0;
  await Promise.all(
    Array.from({ length: limit }, async () => {
      while (i < items.length) {
        const idx = i++;
        out[idx] = await fn(items[idx]);
      }
    }),
  );
  return out;
}

await ensureBucket();
const gone = [];
const failed = [];
let changed = 0;

for (const table of TABLES) {
  const rows = (await loadRows(table)).filter((r) => !r.image_url.startsWith(publicBase));
  log(`${table}: ${rows.length} images to mirror`);
  const results = await mapLimit(rows, 4, (r) => mirror(table, r));
  for (const [idx, row] of rows.entries()) {
    const r = results[idx];
    if (r.status === "gone") gone.push(`${table}: ${row.name} (${row.image_url})`);
    else if (r.status === "error") failed.push(`${table}: ${row.name}: ${r.reason}`);
    else {
      changed++;
      if (APPLY) await updateRow(table, row.id, r.url);
      console.log(`${APPLY ? "updated" : "would update"} ${table} #${row.id} ${row.name} → ${r.url}`);
    }
  }
}

log(`\n${changed} image(s) ${APPLY ? "mirrored and updated" : "uploaded (dry run — re-run with --apply to switch the catalog over)"}.`);
if (gone.length) log(`\nGone from the wiki (fix with tools/fix-broken-images.mjs, then re-run):\n  ${gone.join("\n  ")}`);
if (failed.length) log(`\nFailed (safe to re-run):\n  ${failed.join("\n  ")}`);
