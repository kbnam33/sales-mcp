# Learnings and Bug Fixes

## 1. Wrangler failed to deploy
**Error**: `Module not found: Can't resolve 'wrangler'`  
**Fix**: Use `npm install -D wrangler@latest` and check `wrangler.toml` path

## 2. OAuth2 redirect failure
**Error**: Callback URL mismatch  
**Fix**: Set proper authorized redirect URIs in Google Console

## 3. KV not persisting data
**Error**: `undefined` return on `KV.get()`  
**Fix**: TTL was too short. Increased to 1 hour

## 4. Google tokens not refreshing
**Fix**: Store refresh_token in KV and re-authenticate in background