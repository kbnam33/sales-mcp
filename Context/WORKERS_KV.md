# Workers KV

Used to persist session tokens, agent states, or lead signal scores.

## Usage
```ts
await TOKENS_KV.put("user:123:token", token, { expirationTtl: 3600 });
const score = await TOKENS_KV.get("lead:456:intent_score");
```

## Best Practices
- Use structured keys: `lead:<id>:intent_score`
- Keep values < 25KB
- Use TTL where needed

## Docs
- [KV Docs](https://developers.cloudflare.com/workers/runtime-apis/kv)