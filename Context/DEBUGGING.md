# Debugging MCP Server

## Logs
Use `wrangler tail` to stream Cloudflare Worker logs.

## Common Errors
- `403`: Invalid OAuth callback
- `KV null`: Key expired or mistyped

## Debug Flow
1. Test locally with `wrangler dev`
2. Check headers and payloads
3. Confirm token TTLs in KV

## Debug Tips
- Store `console.log` for intermediate values
- Use timestamped KV keys for step tracking