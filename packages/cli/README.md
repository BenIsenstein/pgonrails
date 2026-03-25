# PG On Rails CLI

Deploy a complete self-hosted [Supabase](https://supabase.com/) instance with [PG On Rails](https://github.com/BenIsenstein/pgonrails) on [Railway](https://railway.com/), with CI/CD configured, from your terminal, **hands-free**, in **minutes**.

*"PG On Rails | Self-hosted Supabase. Amazing developer experience."*

Prefer to use Railway's web UI?

[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/deploy/complete-supabase-nextjs-frontend?referralCode=benisenstein&utm_medium=integration&utm_source=template&utm_campaign=generic)

## Prerequisites

- Node.js 18+ (or Bun)
- GitHub account
- Railway account
- Granted consent for Railway to use GitHub on your behalf
- Railway API token

## Quickstart

```sh
npx create-pgonrails
```

Input your Railway API token when prompted.

Or set the token via environment variable:

```sh
RAILWAY_TOKEN=your-token npx create-pgonrails
```

### Options

- `--dry-run` - Preview what the CLI will do without making any API calls

```sh
npx create-pgonrails --dry-run
```

## Legacy Shell Script

You can run the legacy shell script directly, although it is no longer maintained:

```sh
bash <(curl -fsSL https://raw.githubusercontent.com/BenIsenstein/pgonrails-cli/main/start.sh)
```

## Working with your new self-hosted Supabase project

It will take about 5 minutes to deploy and configure itself, and will print progress updates.

Clone your new GitHub repo:

```sh
git clone YOUR_REPO
```

Run your Supabase project locally:

```sh
cd YOUR_REPO && ./setup.sh && docker compose up
```

Commit new code and watch your project deploy continuously :)

## Learn more

To learn more about PG On Rails visit the [GitHub repo.](https://github.com/BenIsenstein/pgonrails)
