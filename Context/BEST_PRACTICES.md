# Best Practices

## Context Engineering
- Use structured key-value models
- Inject only necessary context to reduce token bloat
- Maintain persistent `LEARNING.md` file with bug resolutions

## Signal Flow Design
- Validate all payloads before action
- Score leads with TTL on signals
- Avoid duplicate trigger activations

## KV Design
- Use prefixes: `user:`, `lead:`, `ctx:` etc.
- TTL for ephemeral data (access_tokens)