# Error Codes & Structure

## Standard Error Response Format
```json
{
  "error": true,
  "code": "AUTH_EXPIRED",
  "message": "OAuth token expired, re-auth required.",
  "retry": true
}
```

## Common Codes
| Code              | Description                         |
|-------------------|-------------------------------------|
| `AUTH_EXPIRED`    | Google OAuth2 token expired         |
| `KV_MISSING`      | Token/session not found in KV       |
| `INVALID_PAYLOAD` | Request missing fields or malformed |