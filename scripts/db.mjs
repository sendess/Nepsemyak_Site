// Database maintenance for the Neon branch in .env.local.
//
//   npm run db:migrate                  apply pending files in db/migrations
//   npm run db:status                   list applied and pending migrations
//   npm run db:add-admin -- <email> [owner|editor] [name]
//   npm run db:reset-2fa -- <email>     emergency: lost phone and recovery codes
//
// Run `neon checkout <branch>` first to choose which branch these commands touch.
import { readdir, readFile } from 'node:fs/promises';
import { Pool } from '@neondatabase/serverless';

const url = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL is missing. Run with: node --env-file=.env.local scripts/db.mjs <command>');
  process.exit(1);
}

const pool = new Pool({ connectionString: url });
const dir = new URL('../db/migrations/', import.meta.url);
const [command = 'status', ...args] = process.argv.slice(2);

async function migrationState() {
  await pool.query(`create table if not exists schema_migrations (
    name text primary key,
    applied_at timestamptz not null default now()
  )`);
  const files = (await readdir(dir)).filter((f) => f.endsWith('.sql')).sort();
  const { rows } = await pool.query('select name from schema_migrations');
  const applied = new Set(rows.map((r) => r.name));
  return { files, applied };
}

async function migrate() {
  const { files, applied } = await migrationState();
  const pending = files.filter((f) => !applied.has(f));
  if (pending.length === 0) return console.log('Database is up to date.');

  for (const file of pending) {
    const sql = await readFile(new URL(file, dir), 'utf8');
    const client = await pool.connect();
    try {
      await client.query('begin');
      await client.query(sql);
      await client.query('insert into schema_migrations (name) values ($1)', [file]);
      await client.query('commit');
      console.log(`Applied ${file}`);
    } catch (err) {
      await client.query('rollback');
      throw new Error(`${file} failed: ${err.message}`);
    } finally {
      client.release();
    }
  }
}

async function status() {
  const { files, applied } = await migrationState();
  const branch = process.env.NEON_BRANCH ?? 'unknown';
  console.log(`Branch: ${branch}`);
  for (const f of files) console.log(`${applied.has(f) ? '  applied' : '  PENDING'}  ${f}`);
}

async function addAdmin() {
  const [rawEmail, role = 'editor', ...nameParts] = args;
  const email = rawEmail?.trim().toLowerCase();
  if (!email || !email.includes('@') || !['owner', 'editor'].includes(role)) {
    throw new Error('Usage: npm run db:add-admin -- <email> [owner|editor] [name]');
  }
  const name = nameParts.join(' ');
  await pool.query(
    `insert into admin_users (email, role, name, created_by) values ($1, $2, $3, 'cli')
     on conflict (email) do update set role = excluded.role, name = coalesce(nullif(excluded.name, ''), admin_users.name)`,
    [email, role, name],
  );
  console.log(`${email} can now use the admin panel as ${role}.`);
}

/** Clears someone's authenticator so they set it up again at next sign-in (the website does this for sub-admins). */
async function resetTwoFactor() {
  const email = args[0]?.trim().toLowerCase();
  if (!email) throw new Error('Usage: npm run db:reset-2fa -- <email>');
  const client = await pool.connect();
  try {
    await client.query('begin');
    const { rowCount } = await client.query(
      `update admin_users set totp_secret = null, totp_pending_secret = null, totp_enabled_at = null, totp_last_step = null
       where email = $1`,
      [email],
    );
    if (rowCount === 0) throw new Error(`${email} is not an admin.`);
    await client.query('delete from admin_recovery_codes where email = $1', [email]);
    await client.query('delete from admin_mfa_sessions where email = $1', [email]);
    await client.query(
      `insert into audit_log (actor_email, action, entity, entity_id, label) values (null, 'two_factor_reset', 'auth', $1, $2)`,
      [email, `Reset for ${email} from the command line`],
    );
    await client.query('commit');
  } catch (err) {
    await client.query('rollback');
    throw err;
  } finally {
    client.release();
  }
  console.log(`${email} will set up their authenticator again at next sign-in.`);
}

const commands = { migrate, status, 'add-admin': addAdmin, 'reset-2fa': resetTwoFactor };
try {
  if (!commands[command]) throw new Error(`Unknown command "${command}". Use: ${Object.keys(commands).join(', ')}`);
  await commands[command]();
} catch (err) {
  console.error(err.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
