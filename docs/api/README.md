# 📡 LystBot API reference

> Base URL: `https://lystbot.com/api/v1`

LystBot exposes the same list, category, and reminder data that powers the mobile app, CLI, and MCP server.

Unless stated otherwise, request and response bodies use `Content-Type: application/json`. Image uploads use `multipart/form-data`; image and thumbnail GETs return authenticated binary image responses.

---

## Authentication

### Mobile app / device auth

First-party app requests from version 1.0.8 use Bearer authentication with the app context header:

```http
Authorization: Bearer your-api-key
X-LystBot-Client: app
```

`X-Device-UUID` is legacy-only and is rejected with `bearer_required` after the device migrates to Bearer authentication.

### Agents, CLI, MCP, automations

Use a Bearer API key:

```http
Authorization: Bearer your-api-key
```

Bearer responses redact member `device_uuid` and item `created_by` to `null`. Use `is_me` and `role` to identify your own membership and display permissions. Agents do not need the app context header.

### Agent self-management

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
      "device_uuid": null,
      "is_me": true,
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
      "created_by": null,
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
      "created_by": null,
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

### `PUT /lists/reorder`

Set the caller's list order. Include every current list exactly once, in array order with consecutive integer positions starting at zero. This example assumes the caller has exactly two lists; replace the IDs with the complete current set. Invalid shape returns `400`, inaccessible lists `403`, and an incomplete or stale set `409`.

```bash
curl -X PUT https://lystbot.com/api/v1/lists/reorder \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"order": [{"list_id": "LIST_ID_1", "position": 0}, {"list_id": "LIST_ID_2", "position": 1}]}'
```

Returns `{"success": true}`.

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

## Attachments

Items can carry image and link attachments. Images accept JPEG, PNG or WebP up to 5 MiB. The server converts them to JPEG with a maximum long edge of 1600 px and creates thumbnails with a maximum long edge of 300 px. URL attachments accept http/https links up to 2048 bytes and optional titles up to 255 characters; links are stored without fetching or unfurling.

For images, `url` is `null`. Prefix `image_path` and `thumbnail_path` with the API base URL and send the same authentication as for the item. URL attachments contain the external link in `url` and have `image_path: null`. An image attachment looks like:

```json
{
  "id": "ATTACHMENT_ID",
  "type": "image",
  "url": null,
  "image_path": "/attachments/ATTACHMENT_ID",
  "title": null,
  "thumbnail_path": "/attachments/ATTACHMENT_ID/thumbnail",
  "mime_type": "image/jpeg"
}
```

### `POST /items/{itemId}/attachments/images`

Upload an image as `multipart/form-data` with a single `file` field. Do not set `Content-Type` manually; the boundary must come from the client.

```bash
curl -X POST https://lystbot.com/api/v1/items/ITEM_ID/attachments/images \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -F "file=@photo.jpg"
```

Responds `201` with the attachment object.

### `POST /items/{itemId}/attachments/urls`

```bash
curl -X POST https://lystbot.com/api/v1/items/ITEM_ID/attachments/urls \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com/recipe", "title": "Recipe"}'
```

| Field | Type | Required |
|-------|------|----------|
| `url` | string | yes |
| `title` | string or null | no |

Responds `201` with the attachment object.

### `GET /items/{itemId}/attachments`

```bash
curl https://lystbot.com/api/v1/items/ITEM_ID/attachments \
  -H "Authorization: Bearer YOUR_API_KEY"
```

```json
{
  "attachments": [
    { "id": "ATTACHMENT_ID", "type": "image", "url": null, "title": null, "image_path": "/attachments/ATTACHMENT_ID", "thumbnail_path": "/attachments/ATTACHMENT_ID/thumbnail", "mime_type": "image/jpeg" },
    { "id": "...", "type": "url", "url": "https://example.com/recipe", "title": "Recipe", "image_path": null, "thumbnail_path": null, "mime_type": null }
  ]
}
```

### `GET /attachments/{attachmentId}` and `GET /attachments/{attachmentId}/thumbnail`

Both return raw image bytes, not JSON. The app uses them for display.

### `DELETE /attachments/{attachmentId}`

```bash
curl -X DELETE https://lystbot.com/api/v1/attachments/ATTACHMENT_ID \
  -H "Authorization: Bearer YOUR_API_KEY"
```

```json
{
  "success": true
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
      "device_uuid": null,
      "is_me": false,
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

## Reminders

Agents, the CLI, the MCP server and automations manage reminders with the same Bearer API key shown above.

Fields:

- `id`: reminder UUID; optional on creation, generated by the server when omitted or empty. A supplied non-empty ID must be a valid UUID.
- `title`: reminder text
- `scheduled_at`: scheduled date/time string
- `timezone`: IANA timezone, for example `Europe/Berlin`
- `repeat`: `none`, `daily`, `weekly`, `biweekly`, `monthly`, `yearly`
- `is_enabled`: whether the reminder is active

The API accepts one-time reminders (`"repeat": "none"`) with a timestamp in the past. Use a future local date and time for a future notification. Replace the dates in the examples below with your intended future time in the specified timezone.

### `GET /reminders`

Returns all reminders for the current device / agent.

```bash
curl https://lystbot.com/api/v1/reminders \
  -H "Authorization: Bearer YOUR_API_KEY"
```

```json
{
  "reminders": [
    {
      "id": "reminder-uuid",
      "title": "Take vitamins",
      "scheduled_at": "2099-01-01T09:00:00",
      "timezone": "Europe/Berlin",
      "repeat": "none",
      "is_enabled": true
    }
  ]
}
```

### `POST /reminders`

Create a reminder.

```bash
curl -X POST https://lystbot.com/api/v1/reminders \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Take vitamins",
    "scheduled_at": "2099-01-01 09:00",
    "timezone": "Europe/Berlin",
    "repeat": "none",
    "is_enabled": true
  }'
```

```json
{
  "id": "reminder-uuid",
  "title": "Take vitamins",
  "scheduled_at": "2099-01-01T09:00:00",
  "timezone": "Europe/Berlin",
  "repeat": "none",
  "is_enabled": true
}
```

### `GET /reminders/{id}`

Returns one reminder.

```bash
curl https://lystbot.com/api/v1/reminders/REMINDER_ID \
  -H "Authorization: Bearer YOUR_API_KEY"
```

```json
{
  "id": "reminder-uuid",
  "title": "Take vitamins",
  "scheduled_at": "2099-01-01T09:00:00",
  "timezone": "Europe/Berlin",
  "repeat": "none",
  "is_enabled": true
}
```

### `PUT /reminders/{id}`

Update any of: `title`, `scheduled_at`, `timezone`, `repeat`, `is_enabled`.

```bash
curl -X PUT https://lystbot.com/api/v1/reminders/REMINDER_ID \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Take supplements",
    "scheduled_at": "2099-01-02 09:00",
    "timezone": "Europe/Berlin",
    "repeat": "daily",
    "is_enabled": true
  }'
```

```json
{
  "id": "reminder-uuid",
  "title": "Take supplements",
  "scheduled_at": "2099-01-02T09:00:00",
  "timezone": "Europe/Berlin",
  "repeat": "daily",
  "is_enabled": true
}
```

### `DELETE /reminders/{id}`

Delete a reminder.

```bash
curl -X DELETE https://lystbot.com/api/v1/reminders/REMINDER_ID \
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

## Agent profile

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
- CLI and local MCP counts are integers in `1..99`. REST quantity handling depends on `unit`: creation validates the applicable range, while updates clamp values to it. Do not infer REST limits from CLI limits.
- Items without `category_id` appear in **Other** / uncategorized
- Deleting a category moves its items to **Other** / uncategorized
- The CLI (`npx lystbot`) and built-in MCP server use these same endpoints
