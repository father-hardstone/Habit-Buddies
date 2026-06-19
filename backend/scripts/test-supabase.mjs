import dotenv from 'dotenv';
import pg from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const { Client } = pg;

const required = [
  'DATABASE_URL',
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'SUPABASE_STORAGE_BUCKET',
  'SUPABASE_AVATARS_FOLDER',
  'SUPABASE_GROUP_IMAGES_FOLDER',
];

/** @type {{ name: string; ok: boolean; detail: string }[]} */
const results = [];

function record(name, ok, detail) {
  results.push({ name, ok, detail });
  const icon = ok ? 'PASS' : 'FAIL';
  console.log(`[${icon}] ${name}: ${detail}`);
}

function decodeJwtRole(token) {
  try {
    const payload = JSON.parse(
      Buffer.from(token.split('.')[1], 'base64url').toString(),
    );
    return payload.role ?? 'unknown';
  } catch {
    return 'invalid';
  }
}

async function testDatabase() {
  const urls = [
    ['DATABASE_URL', process.env.DATABASE_URL],
  ];

  if (process.env.DATABASE_URL?.includes(':5432/')) {
    urls.push([
      'DATABASE_URL (pooler :6543)',
      process.env.DATABASE_URL.replace(':5432/', ':6543/'),
    ]);
  }

  /** @type {string | null} */
  let connected = null;

  for (const [label, connectionString] of urls) {
    if (!connectionString) continue;

    const client = new Client({
      connectionString,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 15000,
    });

    try {
      await client.connect();
      const version = await client.query(
        'select current_database(), current_user',
      );
      record(
        `Postgres connection (${label})`,
        true,
        `connected as ${version.rows[0].current_user} on ${version.rows[0].current_database}`,
      );
      connected = connectionString;
      await client.end();
      break;
    } catch (error) {
      record(`Postgres connection (${label})`, false, error.message);
      try {
        await client.end();
      } catch {
        // ignore
      }
    }
  }

  if (connected?.includes(':6543/') && process.env.DATABASE_URL?.includes(':5432/')) {
    record(
      'Postgres tip',
      true,
      'port 5432 failed; use :6543 in DATABASE_URL on this network',
    );
  }
}

async function supabaseFetch(pathname, options = {}) {
  const baseUrl = process.env.SUPABASE_URL?.replace(/\/$/, '');
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
  const response = await fetch(`${baseUrl}${pathname}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${key}`,
      apikey: key,
      ...(options.headers ?? {}),
    },
  });

  const text = await response.text();
  let body;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }

  return { response, body };
}

async function testStorage() {
  const bucket = process.env.SUPABASE_STORAGE_BUCKET;
  const avatarsFolder = process.env.SUPABASE_AVATARS_FOLDER;
  const groupsFolder = process.env.SUPABASE_GROUP_IMAGES_FOLDER;

  const { response: listResponse, body: buckets } = await supabaseFetch(
    '/storage/v1/bucket',
  );

  if (!listResponse.ok) {
    record('Storage API', false, buckets?.message ?? listResponse.statusText);
    return;
  }

  const bucketNames = Array.isArray(buckets) ? buckets.map((b) => b.name) : [];
  const bucketExists = bucketNames.includes(bucket);

  record(
    'Storage bucket',
    bucketExists,
    bucketExists
      ? `found "${bucket}" (${bucketNames.join(', ') || 'no other buckets'})`
      : `missing "${bucket}". Found: ${bucketNames.join(', ') || 'none'}`,
  );

  if (!bucketExists) {
    return;
  }

  const testPath = `${avatarsFolder}/connection-test.txt`;
  const payload = `habit-buddies supabase test ${new Date().toISOString()}`;

  const { response: uploadResponse, body: uploadBody } = await supabaseFetch(
    `/storage/v1/object/${bucket}/${testPath}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
        'x-upsert': 'true',
      },
      body: payload,
    },
  );

  if (!uploadResponse.ok) {
    record(
      'Storage upload (avatars folder)',
      false,
      uploadBody?.message ?? uploadResponse.statusText,
    );
    return;
  }

  const publicUrl = `${process.env.SUPABASE_URL?.replace(/\/$/, '')}/storage/v1/object/public/${bucket}/${testPath}`;
  const publicResponse = await fetch(publicUrl);

  record(
    'Storage upload (avatars folder)',
    uploadResponse.ok,
    `uploaded to ${avatarsFolder}/`,
  );

  record(
    'Public URL read',
    publicResponse.ok,
    publicResponse.ok
      ? `readable at public URL`
      : `HTTP ${publicResponse.status} for public object`,
  );

  record(
    'Group-images folder path',
    true,
    `will use ${groupsFolder}/ prefix (folder created on first upload)`,
  );

  await supabaseFetch(`/storage/v1/object/${bucket}/${testPath}`, {
    method: 'DELETE',
  });

  record('Storage cleanup', true, 'removed test file');
}

async function main() {
  console.log('\nSupabase configuration test\n');

  for (const name of required) {
    record(`Env: ${name}`, Boolean(process.env[name]), process.env[name] ? 'set' : 'missing');
  }

  const role = decodeJwtRole(process.env.SUPABASE_SERVICE_ROLE_KEY ?? '');
  record(
    'Service role key',
    role === 'service_role',
    role === 'service_role' ? 'service_role key detected' : `expected service_role, got ${role}`,
  );

  await testDatabase();
  await testStorage();

  const failed = results.filter((r) => !r.ok).length;
  console.log(`\n${failed === 0 ? 'All checks passed.' : `${failed} check(s) failed.`}\n`);
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
