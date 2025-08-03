# Example Payloads

## Lead Signal Ingestion
```json
{
  "lead_id": "xyz-123",
  "source": "apollo",
  "signal": "opened_email",
  "timestamp": "2025-08-03T13:00:00Z"
}
```

## Response to User
```json
{
  "status": "engaged",
  "score": 85,
  "next_action": "schedule_followup"
}
```