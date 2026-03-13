# 📡 LystBot API Reference

> Base URL: `https://daffy.touraround.io/lystbot/api/v1`

All requests and responses use `Content-Type: application/json`.

---

## Authentication

LystBot uses a dual authentication system:

### 1. Device Auth (Mobile App)

Used by the mobile app. Pass the device UUID as a header:

```
X-Device-UUID: your-device-uuid
```

### 2. Bearer Token (Agents / CLI)

Used by AI agents, CLI, and external integrations:

```
Authorization: Bearer your-api-key
```

To get a Bearer token, first register a device, then retrieve its API key.

---

## Endpoints

### Health Check

```
GET /api/v1/health
```

No authentication required.

```bash
curl https://daffy.touraround.io/lystbot/api/v1/health
```

```json
{
  "status": "ok"
}
```

---

### Device Registration

```
POST /api/v1/devices/register
```

No authentication required. Registers a new device and returns a UUID.

```bash
curl -X POST https://daffy.touraround.io/lystbot/api/v1/devices/register \
  -H "Content-Type: application/json" \
  -d '{"name": "My Agent", "platform": "cli"}'
```

```json
{
  "uuid": "550e8400-e29b-41d4-a716-446655440000",
  "name": "My Agent",
  "platform": "cli",
  "createdAt": "2026-03-13T09:00:00Z"
}
```

---

### Update Device

```
PATCH /api/v1/devices/{uuid}
```

Auth: `X-Device-UUID`

```bash
curl -X PATCH https://daffy.touraround.io/lystbot/api/v1/devices/YOUR_UUID \
  -H "X-Device-UUID: YOUR_UUID" \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated Name", "pushToken": "fcm-token-here"}'
```

---

### Get API Key

```
GET /api/v1/devices/{uuid}/api-key
```

Auth: `X-Device-UUID`

Retrieves a Bearer token for agent/CLI authentication.

```bash
curl https://daffy.touraround.io/lystbot/api/v1/devices/YOUR_UUID/api-key \
  -H "X-Device-UUID: YOUR_UUID"
```

```json
{
  "apiKey": "lystbot_ak_xxxxxxxxxxxxxxxxxxxx"
}
```

---

### Lists

#### Get All Lists

```
GET /api/v1/lists
```

Auth: `X-Device-UUID` or `Bearer Token`

```bash
curl https://daffy.touraround.io/lystbot/api/v1/lists \
  -H "Authorization: Bearer YOUR_API_KEY"
```

```json
[
  {
    "id": 1,
    "name": "Groceries",
    "emoji": "🛒",
    "itemCount": 5,
    "checkedCount": 2,
    "shared": true,
    "createdAt": "2026-03-13T09:00:00Z",
    "updatedAt": "2026-03-13T10:30:00Z"
  }
]
```

#### Create List

```
POST /api/v1/lists
```

Auth: `X-Device-UUID` or `Bearer Token`

```bash
curl -X POST https://daffy.touraround.io/lystbot/api/v1/lists \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name": "Groceries", "emoji": "🛒"}'
```

```json
{
  "id": 1,
  "name": "Groceries",
  "emoji": "🛒",
  "itemCount": 0,
  "checkedCount": 0,
  "shared": false,
  "createdAt": "2026-03-13T09:00:00Z",
  "updatedAt": "2026-03-13T09:00:00Z"
}
```

#### Get Single List

```
GET /api/v1/lists/{id}
```

Auth: `X-Device-UUID` or `Bearer Token`

```bash
curl https://daffy.touraround.io/lystbot/api/v1/lists/1 \
  -H "Authorization: Bearer YOUR_API_KEY"
```

```json
{
  "id": 1,
  "name": "Groceries",
  "emoji": "🛒",
  "items": [
    {
      "id": 1,
      "text": "Oat milk",
      "checked": false,
      "position": 0,
      "createdAt": "2026-03-13T09:00:00Z"
    },
    {
      "id": 2,
      "text": "Bananas",
      "checked": true,
      "position": 1,
      "createdAt": "2026-03-13T09:01:00Z"
    }
  ],
  "shared": true,
  "shareCode": "ABC123",
  "members": 2,
  "createdAt": "2026-03-13T09:00:00Z",
  "updatedAt": "2026-03-13T10:30:00Z"
}
```

#### Update List

```
PUT /api/v1/lists/{id}
```

Auth: `X-Device-UUID` or `Bearer Token`

```bash
curl -X PUT https://daffy.touraround.io/lystbot/api/v1/lists/1 \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name": "Weekly Groceries", "emoji": "🛒"}'
```

#### Delete List

```
DELETE /api/v1/lists/{id}
```

Auth: `X-Device-UUID` or `Bearer Token`

```bash
curl -X DELETE https://daffy.touraround.io/lystbot/api/v1/lists/1 \
  -H "Authorization: Bearer YOUR_API_KEY"
```

Returns `204 No Content` on success.

---

### Items

#### Add Item to List

```
POST /api/v1/lists/{id}/items
```

Auth: `X-Device-UUID` or `Bearer Token`

```bash
curl -X POST https://daffy.touraround.io/lystbot/api/v1/lists/1/items \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"text": "Coffee beans"}'
```

```json
{
  "id": 3,
  "text": "Coffee beans",
  "checked": false,
  "position": 2,
  "createdAt": "2026-03-13T09:05:00Z"
}
```

#### Update Item

```
PUT /api/v1/lists/{id}/items/{itemId}
```

Auth: `X-Device-UUID` or `Bearer Token`

```bash
curl -X PUT https://daffy.touraround.io/lystbot/api/v1/lists/1/items/3 \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"text": "Coffee beans (whole)", "checked": true}'
```

#### Delete Item

```
DELETE /api/v1/lists/{id}/items/{itemId}
```

Auth: `X-Device-UUID` or `Bearer Token`

```bash
curl -X DELETE https://daffy.touraround.io/lystbot/api/v1/lists/1/items/3 \
  -H "Authorization: Bearer YOUR_API_KEY"
```

Returns `204 No Content` on success.

---

### Sharing

#### Share a List

```
POST /api/v1/lists/{id}/share
```

Auth: `X-Device-UUID` or `Bearer Token`

Generates a share code that others can use to join the list.

```bash
curl -X POST https://daffy.touraround.io/lystbot/api/v1/lists/1/share \
  -H "Authorization: Bearer YOUR_API_KEY"
```

```json
{
  "shareCode": "ABC123",
  "listId": 1,
  "listName": "Groceries"
}
```

#### Join a Shared List

```
POST /api/v1/lists/join
```

Auth: `X-Device-UUID` or `Bearer Token`

```bash
curl -X POST https://daffy.touraround.io/lystbot/api/v1/lists/join \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"shareCode": "ABC123"}'
```

```json
{
  "id": 1,
  "name": "Groceries",
  "emoji": "🛒",
  "itemCount": 5,
  "shared": true
}
```

#### Leave a Shared List

```
POST /api/v1/lists/{id}/leave
```

Auth: `X-Device-UUID` or `Bearer Token`

```bash
curl -X POST https://daffy.touraround.io/lystbot/api/v1/lists/1/leave \
  -H "Authorization: Bearer YOUR_API_KEY"
```

Returns `204 No Content` on success.

---

### Favorites

Favorites are reusable item templates (e.g. "Milk" that you add to your grocery list every week).

#### Get All Favorites

```
GET /api/v1/favorites
```

Auth: `X-Device-UUID` or `Bearer Token`

```bash
curl https://daffy.touraround.io/lystbot/api/v1/favorites \
  -H "Authorization: Bearer YOUR_API_KEY"
```

```json
[
  {
    "id": 1,
    "text": "Milk",
    "emoji": "🥛",
    "useCount": 12,
    "lastUsedAt": "2026-03-12T18:00:00Z"
  }
]
```

#### Create Favorite

```
POST /api/v1/favorites
```

Auth: `X-Device-UUID` or `Bearer Token`

```bash
curl -X POST https://daffy.touraround.io/lystbot/api/v1/favorites \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"text": "Milk", "emoji": "🥛"}'
```

#### Update Favorite

```
PUT /api/v1/favorites/{id}
```

Auth: `X-Device-UUID` or `Bearer Token`

```bash
curl -X PUT https://daffy.touraround.io/lystbot/api/v1/favorites/1 \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"text": "Oat Milk", "emoji": "🥛"}'
```

#### Delete Favorite

```
DELETE /api/v1/favorites/{id}
```

Auth: `X-Device-UUID` or `Bearer Token`

```bash
curl -X DELETE https://daffy.touraround.io/lystbot/api/v1/favorites/1 \
  -H "Authorization: Bearer YOUR_API_KEY"
```

Returns `204 No Content` on success.

#### Use Favorite

```
POST /api/v1/favorites/{id}/use
```

Auth: `X-Device-UUID` or `Bearer Token`

Adds the favorite item to a specified list.

```bash
curl -X POST https://daffy.touraround.io/lystbot/api/v1/favorites/1/use \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"listId": 1}'
```

---

### Agent Profile

#### Update Agent Profile

```
PATCH /api/v1/agents/me
```

Auth: `Bearer Token` only

```bash
curl -X PATCH https://daffy.touraround.io/lystbot/api/v1/agents/me \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name": "TARS", "description": "Personal AI assistant"}'
```

---

## Error Responses

All errors follow this format:

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "List not found"
  }
}
```

**Common error codes:**

- `400` - **BAD_REQUEST** - Invalid or missing parameters
- `401` - **UNAUTHORIZED** - Missing or invalid authentication
- `403` - **FORBIDDEN** - You don't have access to this resource
- `404` - **NOT_FOUND** - Resource not found
- `409` - **CONFLICT** - Resource already exists (e.g. already joined a list)
- `422` - **VALIDATION_ERROR** - Request body validation failed
- `429` - **RATE_LIMITED** - Too many requests, slow down
- `500` - **INTERNAL_ERROR** - Something went wrong on our end

---

## Rate Limits

- **100 requests per minute** per API key
- `429` responses include a `Retry-After` header

---

## Tips for AI Agents

1. **Register once, reuse the token** - Don't register a new device for every session
2. **Use Bearer tokens** - They're designed for programmatic access
3. **Check items, don't delete them** - Users expect to see what was completed
4. **Respect list ownership** - Only modify lists you have access to
5. **Parse the error codes** - They're machine-readable by design
