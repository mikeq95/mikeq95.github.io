// Upload an image to the Cloudflare R2 bucket via the S3-compatible API,
// then print its public CDN URL.
//
// Usage:
//   npm run upload-image -- <local-file> [remote-key]
//
// Examples:
//   npm run upload-image -- static/img/poluobaby.jpg
//       -> uploads to coverimage/poluobaby.jpg
//   npm run upload-image -- static/img/poluobaby.jpg coverimage/logo-poro.jpg
//
// Reads credentials from .env.local:
//   CLOUDFLARE_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY,
//   R2_BUCKET, R2_PUBLIC_BASE
import { readFileSync } from 'node:fs';
import { basename, extname } from 'node:path';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// Load .env.local (simple KEY=value parser; ignores comments/blank lines)
try {
  const env = readFileSync(new URL('../.env.local', import.meta.url), 'utf8');
  for (const line of env.split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2];
  }
} catch { /* .env.local optional if vars already in environment */ }

const {
  CLOUDFLARE_ACCOUNT_ID,
  R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY,
  R2_BUCKET,
  R2_PUBLIC_BASE,
} = process.env;

for (const [k, v] of Object.entries({
  CLOUDFLARE_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET, R2_PUBLIC_BASE,
})) {
  if (!v) { console.error(`Missing ${k} in .env.local`); process.exit(1); }
}

const file = process.argv[2];
if (!file) {
  console.error('Usage: npm run upload-image -- <local-file> [remote-key]');
  process.exit(1);
}
const key = process.argv[3] ?? `coverimage/${basename(file)}`;

const CONTENT_TYPES = {
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.gif': 'image/gif', '.webp': 'image/webp', '.svg': 'image/svg+xml',
  '.avif': 'image/avif', '.ico': 'image/x-icon',
};

const body = readFileSync(file);
const contentType = CONTENT_TYPES[extname(file).toLowerCase()] ?? 'application/octet-stream';

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

console.log(`Uploading ${file} -> ${R2_BUCKET}/${key} ...`);
await s3.send(new PutObjectCommand({
  Bucket: R2_BUCKET,
  Key: key,
  Body: body,
  ContentType: contentType,
}));

console.log('\nPublic URL:');
console.log(`${R2_PUBLIC_BASE.replace(/\/$/, '')}/${key}`);
