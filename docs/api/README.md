# 📡 LystBot API Reference

> Base URL: `https://lystbot.com/api/v1`

LystBot exposes the same shared list data that powers the mobile app, CLI, and MCP server.

All requests and responses use `Content-Type: application/json`.

---

## Authentication

### Mobile App / Device Auth

Use the device UUID header:

```http
X-Device-UUID: your-device-uuid
```

### Agents, CLI, MCP, Automations

Use a Bearer API key:

```http
Authorization: Bearer your-api-key
```

### Agent Self-Management

`PATCH /agents/me` is Bearer-only. No device header is required.

---

## Health

### `GET /health`

```bash
curl https://lystbot.com/api/v1/health
```

```json
{
  "status": "ok"
}
```

---

## Lists

### `GET /lists`

Returns all lists the current device / agent can access.

```bash
curl https://lystbot.com/api/v1/lists \
  -H "Authorization: Bearer YOUR_API_KEY"
```

```json
{
  "lists": [
    {
      "id": "list-uuid",
      "title": "Groceries",
      "type": "shopping",
      "emoji": "🛒",
      "is_shared": true,
      "share_code": "ABC123",
      "member_count": 2,
      "item_count": 5,
      "unchecked_count": 3,
      "updated_at": "2026-04-14T11:00:00Z"
    }
  ]
}
```

### `GET /lists/{id}`

Returns the full list including members, bot members, categories, and items.

```bash
curl https://lystbot.com/api/v1/lists/LIST_ID \
  -H "Authorization: Bearer YOUR_API_KEY"
```

```json
{
  "id": "list-uuid",
  "title": "Groceries",
  "type": "shopping",
  "emoji": "🛒",
  "is_shared": true,
  "share_code": "ABC123",
  "hide_completed": false,
  "members": [
    {
      "device_uuid": "device-uuid",
      "name": "Alex",
      "display_name": "Alex",
      "label": "Alex",
      "signature_emoji": "🙂",
      "role": "owner"
    }
  ],
  "bot_members": [
    {
      "api_key_id": 12,
      "name": "TARS",
      "signature_emoji": "🤖"
    }
  ],
  "categories": [
    {
      "id": "cat-fruit",
      "name": "Fruits",
      "position": 0,
      "created_at": "2026-04-14T10:00:00Z",
      "updated_at": "2026-04-14T10:00:00Z"
    }
  ],
  "items": [
    {
      "id": "item-uuid",
      "category_id": "cat-fruit",
      "text": "Bananas",
      "checked": false,
      "quantity": 2,
      "unit": null,
      "position": 0,
      "created_by": "device-uuid",
      "created_by_api_key_id": 12,
      "updated_at": "2026-04-14T10:05:00Z"
    },
    {
      "id": "item-other",
      "category_id": null,
      "text": "Coffee",
      "checked": false,
      "quantity": 1,
      "unit": null,
      "position": 1,
      "created_by": "device-uuid",
      "created_by_api_key_id": null,
      "updated_at": "2026-04-14T10:06:00Z"
    }
  ],
  "updated_at": "2026-04-14T11:00:00Z"
}
```

### `POST /lists`

Create a new list.

```bash
curl -X POST https://lystbot.com/api/v1/lists \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "new-list-uuid",
    "title": "Groceries",
    "type": "shopping",
    "emoji": "🛒"
  }'
```

```json
{
  "id": "new-list-uuid",
  "created_at": "2026-04-14T11:05:00Z"
}
```

Valid list types: `shopping`, `todo`, `packing`, `generic`

### `PUT /lists/{id}`

Update `title`, `emoji`, or `hide_completed`.

```bash
curl -X PUT https://lystbot.com/api/v1/lists/LIST_ID \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"title": "Weekly Groceries", "emoji": "🛒", "hide_completed": false}'
```

```json
{
  "success": true
}
```

### `DELETE /lists/{id}`

Delete a list.

```bash
curl -X DELETE https://lystbot.com/api/v1/lists/LIST_ID \
  -H "Authorization: Bearer YOUR_API_KEY"
```

```json
{
  "success": true
}
```

---

## Items

### `POST /lists/{id}/items`

Create an item. Supports categories via `category_id`.

```bash
curl -X POST https://lystbot.com/api/v1/lists/LIST_ID/items \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "item-uuid",
    "text": "Bananas",
    "quantity": 2,
    "unit": null,
    "position": 0,
    "category_id": "cat-fruit"
  }'
```

```json
{
  "id": "item-uuid"
}
```

Use `"category_id": null` or omit the field to place the item in **Other** / uncategorized.

### `PUT /lists/{id}/items/{itemId}`

Update any of: `text`, `checked`, `quantity`, `unit`, `position`, `category_id`.

```bash
curl -X PUT https://lystbot.com/api/v1/lists/LIST_ID/items/ITEM_ID \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "checked": true,
    "category_id": null
  }'
```

```json
{
  "success": true,
  "updated_at": "2026-04-14T11:10:00Z"
}
```

### `DELETE /lists/{id}/items/{itemId}`

```bash
curl -X DELETE https://lystbot.com/api/v1/lists/LIST_ID/items/ITEM_ID \
  -H "Authorization: Bearer YOUR_API_KEY"
```

```json
{
  "success": true
}
```

### `DELETE /lists/{id}/items/checked`

Delete all checked items in a list.

```bash
curl -X DELETE https://lystbot.com/api/v1/lists/LIST_ID/items/checked \
  -H "Authorization: Bearer YOUR_API_KEY"
```

```json
{
  "success": true,
  "deleted_count": 3
}
```

---

## Categories

Categories let you structure a list into sections. Items without a `category_id` belong to **Other** / uncategorized.

### `POST /lists/{id}/categories`

Create a category.

```bash
curl -X POST https://lystbot.com/api/v1/lists/LIST_ID/categories \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "cat-fruit",
    "name": "Fruits",
    "position": 0
  }'
```

```json
{
  "id": "cat-fruit",
  "name": "Fruits",
  "position": 0,
  "created_at": "2026-04-14T10:00:00Z",
  "updated_at": "2026-04-14T10:00:00Z"
}
```

### `PUT /lists/{id}/categories/{categoryId}`

Rename a category.

```bash
curl -X PUT https://lystbot.com/api/v1/lists/LIST_ID/categories/CATEGORY_ID \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name": "Fresh Fruits"}'
```

```json
{
  "success": true,
  "id": "cat-fruit",
  "name": "Fresh Fruits",
  "position": 0,
  "created_at": "2026-04-14T10:00:00Z",
  "updated_at": "2026-04-14T10:12:00Z"
}
```

### `PUT /lists/{id}/categories/reorder`

Reorder categories.

```bash
curl -X PUT https://lystbot.com/api/v1/lists/LIST_ID/categories/reorder \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "order": [
      {"category_id": "cat-veg", "position": 0},
      {"category_id": "cat-fruit", "position": 1}
    ]
  }'
```

```json
{
  "success": true
}
```

### `DELETE /lists/{id}/categories/{categoryId}`

Delete a category. Its items are automatically moved to **Other** / uncategorized.

```bash
curl -X DELETE https://lystbot.com/api/v1/lists/LIST_ID/categories/CATEGORY_ID \
  -H "Authorization: Bearer YOUR_API_KEY"
```

```json
{
  "success": true,
  "id": "cat-fruit",
  "moved_count": 4
}
```

---

## Sharing

### `POST /lists/{id}/share`

Generate or return the existing share code.

```bash
curl -X POST https://lystbot.com/api/v1/lists/LIST_ID/share \
  -H "Authorization: Bearer YOUR_API_KEY"
```

```json
{
  "share_code": "ABC123"
}
```

### `POST /lists/join`

Join a shared list via invite code.

```bash
curl -X POST https://lystbot.com/api/v1/lists/join \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"code": "ABC123"}'
```

```json
{
  "list_id": "list-uuid",
  "title": "Groceries",
  "type": "shopping",
  "emoji": "🛒",
  "members": [
    {
      "device_uuid": "device-uuid",
      "name": "Alex",
      "signature_emoji": "🙂",
      "role": "owner"
    }
  ]
}
```

### `POST /lists/{id}/leave`

Leave a shared list.

```bash
curl -X POST https://lystbot.com/api/v1/lists/LIST_ID/leave \
  -H "Authorization: Bearer YOUR_API_KEY"
```

```json
{
  "success": true
}
```

---

## Favorites

### `GET /favorites`

Optional filter: `?type=shopping`

```bash
curl https://lystbot.com/api/v1/favorites?type=shopping \
  -H "Authorization: Bearer YOUR_API_KEY"
```

```json
{
  "favorites": [
    {
      "id": "fav-uuid",
      "text": "Milk",
      "list_type": "shopping",
      "category": "Dairy",
      "use_count": 12,
      "updated_at": "2026-04-14T10:30:00Z"
    }
  ]
}
```

### `POST /favorites`

```bash
curl -X POST https://lystbot.com/api/v1/favorites \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "fav-uuid",
    "text": "Milk",
    "list_type": "shopping",
    "category": "Dairy"
  }'
```

```json
{
  "id": "fav-uuid",
  "created_at": "2026-04-14T10:30:00Z"
}
```

### `PUT /favorites/{id}`

```bash
curl -X PUT https://lystbot.com/api/v1/favorites/FAVORITE_ID \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"text": "Oat Milk", "category": "Dairy"}'
```

```json
{
  "success": true
}
```

### `DELETE /favorites/{id}`

```bash
curl -X DELETE https://lystbot.com/api/v1/favorites/FAVORITE_ID \
  -H "Authorization: Bearer YOUR_API_KEY"
```

```json
{
  "success": true
}
```

### `POST /favorites/{id}/use`

Increment `use_count` for ranking.

```bash
curl -X POST https://lystbot.com/api/v1/favorites/FAVORITE_ID/use \
  -H "Authorization: Bearer YOUR_API_KEY"
```

```json
{
  "use_count": 13
}
```

---

## Agent Profile

### `PATCH /agents/me`

Set the bot's display name and / or signature emoji.

```bash
curl -X PATCH https://lystbot.com/api/v1/agents/me \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name": "TARS", "signature_emoji": "🤖"}'
```

```json
{
  "success": true,
  "name": "TARS",
  "signature_emoji": "🤖"
}
```

---

## Errors

Errors use this shape:

```json
{
  "error": "error_code",
  "message": "Human-readable description"
}
```

Common codes:

- `missing_fields`
- `not_found`
- `forbidden`
- `invalid_api_key`
- `invalid_code`
- `already_member`
- `invalid_category`
- `invalid_type`
- `conflict`
- `max_items_reached`

---

## Notes

- All list, item, category, and favorite IDs should be UUID v4
- `quantity` is limited to `1..99`
- Items without `category_id` appear in **Other** / uncategorized
- Deleting a category moves its items to **Other** / uncategorized
- The CLI (`npx lystbot`) and built-in MCP server use these same endpoints
