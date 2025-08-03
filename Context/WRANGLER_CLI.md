# Wrangler CLI

Wrangler is the CLI tool for deploying and managing Cloudflare Workers.

## Installation
```bash
npm install -D wrangler@latest
```

## Commands
- `wrangler init`: Initialize new Worker
- `wrangler dev`: Local dev server
- `wrangler deploy`: Push to Cloudflare
- `wrangler tail`: View real-time logs

## Config (`wrangler.toml`)
```toml
name = "mcp-server"
main = "src/index.ts"
compatibility_date = "2025-08-03"
```