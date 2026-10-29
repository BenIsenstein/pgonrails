# Upstream Sync: supabase/supabase `docker/` 0.5.0 → 0.8.3

Working doc for the branch `feat/upstream-sync-0.8.3`. pgonrails's last real
sync with upstream self-hosted Supabase was commit `ca42074` (2026-06-07),
which matches upstream's **0.5.0** release (2026-06-03) exactly — every
pinned image version in this repo matched 0.5.0 at the time this doc was
written. Upstream is now at **0.8.3** (2026-10-16). This doc tracks the catch-up.

Research clone: `/tmp/supabase-docker-research` — sparse checkout of
`supabase/supabase` at `docker/` (full history, not shallow). If it's gone,
recreate with:

```sh
git clone --filter=blob:none --no-checkout https://github.com/supabase/supabase.git .
git sparse-checkout init --cone && git sparse-checkout set docker && git checkout master
```

`docker/CHANGELOG.md` and `docker/versions.md` in that clone are the
authoritative, human-curated source for everything below — read those first
before re-deriving anything from raw commits.

## Decisions made (confirmed with user, do not re-litigate)

1. **Gateway: switch default to Envoy.** Kong becomes an opt-in override.
   This matches upstream 0.8.0 (PR #48153). Rationale given to user: upstream
   has a standing deprecation notice on `docker-compose.kong.yml` ("superseded
   by Envoy, will be removed in a future release") — not worth building on a
   path upstream is walking away from.
2. **Storage: keep S3-compatible storage as the *default*** (diverges from
   upstream, which moved to local-filesystem-by-default in the same
   restructuring that demoted MinIO/RustFS to override-only). Reason: pgonrails
   targets Railway, where local filesystem storage wouldn't survive redeploys.
   Within that constraint, swap the backend image from MinIO to RustFS.
3. **Postgres 17 becomes default**, breaking change accepted. Old pg15
   becomes the override (inverse of today, where pg17 is the override).
4. Base this work off branch `origin/automation/update-image-versions-2026-6-17`
   — **but only its mechanical Dockerfile version bumps.** That branch is
   stale otherwise: it predates the TanStack Start migration (`c130575` and
   later) and reverts `/site` back to an old Next.js app. Do NOT merge or
   check it out wholesale. Cherry-pick just the `FROM ...` line changes.
5. One branch, one session. If context usage gets high before this is done,
   stop and file a GitHub issue (not just a note here) describing exactly
   what's done / what's left, with enough detail for a fresh agent to resume
   without re-doing the research in this doc.

## Target image versions (0.5.0 → 0.8.3, from upstream `versions.md`)

| Service | File | From | To |
|---|---|---|---|
| analytics | `analytics/Dockerfile` | `supabase/logflare:1.43.1` | `supabase/logflare:1.50.15` |
| auth | `auth/Dockerfile` | `supabase/gotrue:v2.189.0` | `supabase/gotrue:v2.197.0` |
| rest | `rest/Dockerfile` | `postgrest/postgrest:v14.12` | `postgrest/postgrest:v14.18` |
| realtime | `realtime/Dockerfile` | `supabase/realtime:v2.102.3` | `supabase/realtime:v2.143.3` |
| storage | `storage/Dockerfile` | `supabase/storage-api:v1.60.4` | `supabase/storage-api:v1.81.0` |
| meta | `meta/Dockerfile` | `supabase/postgres-meta:v0.96.6` | `supabase/postgres-meta:v0.100.0` |
| functions | `functions/Dockerfile` | `supabase/edge-runtime:v1.74.0` | `supabase/edge-runtime:v1.77.4` |
| imgproxy | `imgproxy/Dockerfile` | `darthsim/imgproxy:v3.30.1` | `darthsim/imgproxy:v3.31.4` |
| studio | `studio/Dockerfile` | `supabase/studio:2026.06.03-sha-0bca601` | `supabase/studio:2026.10.12-sha-3699278` |
| kong (now override) | `kong/Dockerfile` | `kong/kong:3.9.1` | `kong/kong:3.9.3` |
| envoy (now default) | `envoy/Dockerfile` | `envoyproxy/envoy:v1.38.0` | `envoyproxy/envoy:v1.39.1` |
| db | `db/Dockerfile` | `supabase/postgres:15.8.1.085` | `supabase/postgres:17.6.1.136` |
| rustfs (new) | — | n/a (was `minio/minio:RELEASE...`) | `rustfs/rustfs:1.0.1` |
| vector | `vector/Dockerfile` | `timberio/vector:0.53.0-alpine` | **unchanged** — not tracked upstream |
| pgbouncer | `pgbouncer/Dockerfile` | `edoburu/pgbouncer:v1.25.1-p0` | **unchanged** — pgonrails-specific, not an upstream service (pgonrails uses pgbouncer instead of Supavisor entirely; see archived `archive/supavisor` branch) |
| caddy | `caddy/Dockerfile` | `caddy:2` | **unchanged**, floating tag |

## Structural changes to port (by upstream release)

### 0.6.0 (2026-06-17)
- Postgres 17 default; `pg_graphql` disabled by default on **fresh** installs
  only (upgrades keep it). `docker-compose.pg15.yml` added as rollback/legacy
  override. `utils/upgrade-pg17.sh` exists upstream for in-place upgrades —
  check if pgonrails needs an equivalent (`utils/upgrade-pg17.sh` doesn't
  exist here yet; may be worth porting as a convenience, not required for
  the sync itself since we're defining pg17 as the default for new installs).
- Studio and Postgres Meta connect as `postgres` role, not `supabase_admin`
  (self-hosting discussion #46081). Check pgonrails's `docker-compose.yml`
  studio/meta `DATABASE_URL`/`PG_META_DB_USER` for `supabase_admin` usage.
- **Security fix**: Kong/Envoy must block Realtime `/api/tenants` and
  `/api/openapi` endpoints (currently open in pgonrails's `kong/kong.yml`).
- Kong entrypoint shebang changed to `/bin/sh` (pgonrails's `kong-entrypoint.sh`
  — check current shebang).
- Healthchecks added for `rest` (PostgREST) and `functions` services.

### 0.7.0 (2026-07-07) — breaking
- OpenAPI spec access at `/rest/v1/` via anon/publishable key removed —
  service_role/secret key only now.
- `API_EXTERNAL_URL` default now includes `/auth/v1` suffix (e.g.
  `http://localhost:8000/auth/v1`). Also changes `GOTRUE_JWT_ISSUER`.
- SAML SSO routes move to `/auth/v1/sso/*` (from bare `/sso/*`).
- `KONG_ROUTER_FLAVOR: expressions` added to Kong env.
- `PGRST_DB_SCHEMAS` default changed to `public,graphql_public` (drops
  `storage` from the default exposed-schema list — it's a protected schema).
- `REALTIME_DB_ENC_KEY` moved from hardcoded value to a proper `.env` var
  with a fallback default.

### 0.7.1 (2026-08-03)
- `SUPABASE_JWKS` config added for Edge Functions.
- Kong → 3.9.3, `KONG_DNS_VALID_TTL` added.
- RustFS pinned `v1.0.0-beta.11` at this point (later superseded, see 0.8.3).

### 0.8.0 (2026-08-11) — breaking, THE gateway flip
- Envoy becomes default API gateway. Service renamed `kong` → generic
  `api-gw` in `docker-compose.yml`. `docker-compose.envoy.yml` becomes a
  no-op shim (kept one release cycle for compat). New
  `docker-compose.kong.yml` override added to swap `api-gw` back to Kong.
  `API_GW_HTTP_PORT` env var added (falls back to `KONG_HTTP_PORT`).
  Caddy/nginx overrides updated to point at `api-gw` instead of `kong`.
  **This is the biggest structural change in this sync** — see upstream
  `docker-compose.yml`, `docker-compose.kong.yml`, `docker-compose.envoy.yml`,
  `docker-compose.caddy.yml` in the research clone for the exact shape to
  mirror (adapted to pgonrails's per-service-folder convention, i.e. build
  context `./envoy` by default, `./kong` for the override, rather than
  upstream's `./volumes/api/...` bind-mount convention).

### 0.8.1–0.8.3 (2026-09 to 2026-10-16)
- `volumes/storage/.gitkeep` added for rootless Docker (check if pgonrails's
  `./volumes/storage` bind mount needs the same — pgonrails may already
  gitignore `volumes/` entirely, confirm before adding).
- **Security fix**: removed `app.settings.jwt_secret` exposure. Changes:
  `db/scripts/jwt.sql` (drop the `\set jwt_secret` + `ALTER DATABASE ... SET
  app.settings.jwt_secret`), `docker-compose.yml` (drop
  `PGRST_APP_SETTINGS_JWT_SECRET` and the plain `JWT_SECRET` env on the `db`
  service), keep `JWT_EXP`/`app.settings.jwt_exp`.
- `supabase_functions_admin` granted `USAGE` on `extensions` schema
  (`db/scripts/webhooks.sql`).
- Edge Runtime: structured `{code, message}` error responses, `sb-error-code`
  header, 150s idle timeout → later changed to 410s timeout / 160s idle in
  0.8.3's envoy template (see `lds.template.yaml` diff). Worker retries (up
  to 3) on worker-retiring-before-handling-request.
- `/functions/v1/` route gets `sb_` publishable/secret key translation (same
  as other routes already do) — touches `envoy/lds.template.yaml`,
  `kong/kong.yml`, `kong/kong-entrypoint.sh`, and the functions main worker
  (`volumes/functions/main/index.ts` upstream — pgonrails's `functions/`
  Dockerfile doesn't bundle this file directly, check where pgonrails keeps
  the equivalent, if at all).
- OAuth/OIDC discovery routes reshaped **twice**: 0.8.2 added a bare
  `/.well-known/oauth-authorization-server` route to Caddy/nginx; 0.8.3
  **removed that bare route** and replaced it with platform-aligned routes:
  `/.well-known/oauth-authorization-server/auth/v1` (RFC 8414),
  `/auth/v1/.well-known/oauth-authorization-server`, and
  `/auth/v1/.well-known/openid-configuration` (both auth-prefixed ones
  available without an API key). Final shape is in the current
  `volumes/api/envoy/lds.template.yaml` / `volumes/api/kong.yml` /
  `volumes/proxy/caddy/Caddyfile` in the research clone — **port the current
  state, not the intermediate 0.8.2 shape.**
- **Security fixes covered purely by version bumps** (no config changes
  needed beyond the version bump itself): Storage TUS resumable-upload RLS
  bypass (GHSA-8rrf-w776-x75g, fixed in v1.81.0), Storage Iceberg S3-protocol
  issue (GHSA-67rp-h2mf-ph72, irrelevant if Iceberg disabled — confirm
  pgonrails doesn't enable it), Realtime binary-broadcast message forgery
  (GHSA-9vjf-j9f7-j42c, fixed in v2.143.3 — also makes Realtime run as
  non-root `nobody`, check any mounted files like `DB_SSL_CA_CERT` for
  readability by uid 65534 if pgonrails mounts any).

## RustFS swap specifics

Upstream's `docker-compose.rustfs.yml` (current, 1.0.1):

```yaml
services:
  rustfs:
    image: rustfs/rustfs:1.0.1
    environment:
      RUSTFS_ACCESS_KEY: ${MINIO_ROOT_USER}
      RUSTFS_SECRET_KEY: ${MINIO_ROOT_PASSWORD}
      RUSTFS_CONSOLE_ADDRESS: 0.0.0.0:9001
      RUSTFS_CORS_ALLOWED_ORIGINS: "*"
      RUSTFS_CONSOLE_CORS_ALLOWED_ORIGINS: "*"
    security_opt: ["no-new-privileges:true"]
    healthcheck:
      test: [ "CMD", "curl", "-f", "http://rustfs:9000/health" ]
      interval: 2s
      timeout: 10s
      retries: 5
    volumes: ["rustfs-data:/data"]

  rustfs-createbucket:
    image: rustfs/rc
    depends_on: { rustfs: { condition: service_healthy } }
    entrypoint: >
      /bin/sh -ec "
      rc alias set supa-rustfs http://rustfs:9000 ${MINIO_ROOT_USER} ${MINIO_ROOT_PASSWORD} &&
      rc mb --ignore-existing supa-rustfs/${GLOBAL_S3_BUCKET}
      "

  storage:
    depends_on:
      rustfs-createbucket: { condition: service_completed_successfully }
      rustfs: { condition: service_healthy }
    environment:
      STORAGE_BACKEND: s3
      GLOBAL_S3_ENDPOINT: http://rustfs:9000
      GLOBAL_S3_PROTOCOL: http
      GLOBAL_S3_FORCE_PATH_STYLE: true
      AWS_ACCESS_KEY_ID: ${MINIO_ROOT_USER}
      AWS_SECRET_ACCESS_KEY: ${MINIO_ROOT_PASSWORD}
volumes: { rustfs-data: {} }
```

Note upstream's `storage` env uses `GLOBAL_S3_*` var names, not the
`STORAGE_S3_*` names pgonrails currently uses for its MinIO setup — reconcile
with whatever pgonrails's `storage/` service env currently expects (check
`storage/Dockerfile` and `docker-compose.yml`'s `storage:` block, and
`CONFIG.md`'s Storage section, for pgonrails's actual var names before
copy-pasting upstream names verbatim).

Since pgonrails keeps S3 storage as *default* (not an override), build a
`rustfs/` directory (Dockerfile + `.env.example` + README) mirroring the old
`minio/` directory's role, and wire it directly into the base
`docker-compose.yml` rather than a `docker-compose.rustfs.yml` override.
Decide whether to delete `minio/` outright or keep it around as a
`docker-compose.s3-minio.yml`-style legacy override for anyone mid-migration
with existing MinIO data — leaning toward **delete**, since pgonrails has no
existing production users to migrate (confirm this assumption before
deleting if unsure).

## Gateway flip specifics (Envoy default / Kong override)

pgonrails's existing `docker-compose.envoy.yml` and `docker-compose.caddy.yml`
already anticipated a generic `api-gw` naming scheme in their comments —
this makes the flip easier than greenfield. The target shape (post-flip):

- `docker-compose.yml`: the default gateway service is named `api-gw`,
  `build: ./envoy`. `functions` (and anything else that `depends_on: kong`)
  points at `api-gw` instead.
- `docker-compose.kong.yml` (new): overrides `api-gw` to `build: ./kong`,
  restores the 8443 HTTPS listener Kong provides that Envoy doesn't.
- `docker-compose.envoy.yml`: delete, or reduce to a no-op `services: {}`
  shim with a comment pointing people at the new default (matching upstream's
  deprecation-shim pattern) — lean towards **delete** since pgonrails has no
  external users depending on `sh run.sh config add envoy` yet; confirm.
- `docker-compose.caddy.yml`: simplify to match upstream's current shape —
  reset `api-gw` ports, no more conditional kong/envoy comment block, single
  `depends_on: api-gw`.

## Running the stack while working

No `.env` existed at the start of this session. Use `./setup-env.sh` to
generate one. Docker 29.8.1 / Compose 5.5.1 confirmed available in this
sandbox.

## Progress log

- [x] Image version bumps (all services) — commit `c865b16`
- [x] Postgres 17 default, pg15 override, utils/upgrade-pg17.sh updated — commit `c865b16`
- [x] JWT secret SQL exposure removed, functions_admin extensions grant,
      meta/studio postgres role, API_EXTERNAL_URL /auth/v1, REST_DB_SCHEMAS
      default — commit `c865b16`
- [x] RustFS swap (default, not override; named volume for uid reasons) — commit `0605564`
- [x] Gateway flip: Envoy default, Kong override (docker-compose.kong.yml) — commit `0605564`
- [x] Routing/security parity in both envoy/ and kong/ (REST openapi root,
      Realtime tenants/openapi block, SSO path, OAuth/OIDC discovery routes,
      Functions sb_ key translation) — commit `0605564`
- [x] Verified locally: Envoy-default and Kong-override both boot clean and
      enforce identical security behavior (tested via `docker compose exec`
      against the internal network, since this sandbox's own ingress
      occupies host port 8000 - temporarily set `KONG_PORT=8010` in `.env`
      for host-port testing, then reverted to 8000 before committing; `.env`
      is gitignored so this never touched version control)
- [x] CONFIG.md / README resync - audited, **no changes needed**. CONFIG.md's
      prose already matched the new behavior (JWT_SECRET "not exposed to
      SQL", PGRST_DB_SCHEMAS default `public,graphql_public`) before this
      session touched any code - it's synced against upstream docs/source
      independently of this repo's docker-compose.yml. No gateway-default or
      pinned-image-version claims exist in CONFIG.md or README.md to update.
- [x] Full verification pass - see below.
- [ ] **Follow-up, not done, needs a fresh pass**: `tests/test-auth-keys.sh`
      has several stale assertions left over from before this sync (same
      root cause each time: the script uses the bare `/rest/v1/` OpenAPI
      root and `/realtime/v1/api/tenants` as generic "is the REST/Realtime
      API reachable" probes, both of which are now intentionally
      restricted/blocked). Confirmed via a side-by-side run against
      `/tmp/supabase-docker-research/docker/tests/test-auth-keys.sh`
      (500 lines vs pgonrails's 368 - upstream has diverged more than
      `test-self-hosted.sh` did) that upstream also had to rework this file
      for the same reasons, but its current shape wasn't ported. Needs the
      same treatment `test-self-hosted.sh` already got in this branch:
      - Any assertion hitting `/rest/v1/` expecting 200 for anon/legacy
        ANON_KEY needs to expect 403 instead (200 is still correct for
        SERVICE_ROLE_KEY).
      - Any assertion using `/realtime/v1/api/tenants` as a generic
        reachability probe needs a different endpoint - that path is a
        hard 403 for everyone now. Check what endpoint upstream's current
        file uses instead.
      - The JWKS-contains-EC-public-key failure is very likely unrelated -
        this repo's demo `.env` doesn't have `JWT_KEYS`/asymmetric keys
        configured at all, so that's probably a test-environment gap, not
        a routing bug. Confirm by configuring opaque/asymmetric keys
        (`utils/add-new-auth-keys.sh`) before concluding anything.
      - Re-run with: `sh tests/test-auth-keys.sh http://localhost:8000`
        (bring the stack up first; see "Running the stack" above for the
        sandbox port-8000-conflict workaround if testing in a similar
        environment).
      Tracked as GitHub issue - check `gh issue list` on this repo for the
      exact number if this note has gone stale.
- [x] **Fixed**: the `site` container's crash-loop on `supabase db push`
      (`tls error (The server does not support SSL connections)`) was the
      Supabase CLI defaulting to attempting SSL when none is specified on
      the connection string. The `db` container has no SSL configured at
      all (matches the error's own suggestion), so the fix is explicit:
      append `?sslmode=disable` to `DB_PRIVATE_CONNECTION_STRING` in
      `docker-compose.yml` and to the equivalent connection string in
      `migrate-local.sh`. Verified: `supabase db push` now applies all four
      migrations and the site boots to a 200 on `/`. Did not pin the
      Supabase CLI version (still installed as `latest` via `npm i -g
      supabase` in both `site/Dockerfile` and `site/dev.Dockerfile`) -
      `sslmode=disable` is the durable fix regardless of CLI version, so
      pinning wasn't necessary to resolve this, though it'd still reduce
      drift risk for other future CLI behavior changes if wanted later.

## If handing off to a fresh agent

Read this whole file, then `TaskList` for current status. Do not re-clone or
re-derive the upstream research — it's all above and in
`/tmp/supabase-docker-research` if that directory still exists (recreate per
the command at the top if not). Check `git log` on this branch for what's
already landed vs. what's still a tracked-but-pending Task.
