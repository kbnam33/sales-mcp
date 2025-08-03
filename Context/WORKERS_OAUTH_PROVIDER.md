# Cloudflare Workers as OAuth Provider

You can create a custom OAuth2 provider wrapper inside a Worker.

## Core Code
```ts
Router.post("/authorize", authorizeHandler);
Router.post("/token", tokenHandler);
```

## Notes
- Token lifecycle managed in KV
- `redirect_uri` must be validated against callback

## Reference
- [Authorization Guide](https://developers.cloudflare.com/workers/)