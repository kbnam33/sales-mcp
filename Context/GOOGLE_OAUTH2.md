# Google OAuth2 Setup

## Console Setup
1. Go to [Google Developer Console](https://console.developers.google.com)
2. Create new project > Enable "OAuth2 APIs"
3. Setup credentials: OAuth2 Client ID (Web)
4. Set authorized redirect URI to your Worker endpoint

## Worker Auth Flow (Simplified)
```ts
const url = `https://accounts.google.com/o/oauth2/v2/auth?...`;
// Redirect to `url`
```

## Token Exchange (server-side)
```ts
POST https://oauth2.googleapis.com/token
```