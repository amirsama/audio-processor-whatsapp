# API: WAV → OGG Opus

**Endpoint:** `POST /api/convert`

**Body:** JSON `{ "audioBase64": "<base64 of WAV bytes>" }` or raw body = base64 string.

**Response:** Binary `audio/ogg` (OGG Opus). Use this URL or response for WhatsApp voice messages (UltraMSG).
