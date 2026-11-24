export function buildApiDocs(baseUrl: string): string {
  const api = `${baseUrl}/api/v1`

  return `# Paz Reservations API (v1)

Read this whole document before writing code. It explains how to list rooms, check availability,
read rates, get a price quote and create reservations at Paz from another application.

- Base URL: \`${api}\`
- Format: JSON over HTTPS. Dates are \`YYYY-MM-DD\` (Costa Rica, America/Costa_Rica).
- CORS: enabled for all origins, but **call the API from the server** (Route Handler / Server Action)
  whenever an API key is involved. Never expose the key in client-side code.
- This document is always available as markdown at \`${api}/docs\`.

## Authentication

| Endpoint | Auth |
| --- | --- |
| \`GET /rooms\`, \`GET /rates\`, \`GET /rates/quote\` | Public, no key |
| \`GET /reservations\`, \`GET /reservations/{id}\`, \`POST /reservations\` | API key required |

Send the key in a header (either form works):

\`\`\`
Authorization: Bearer <PAZ_API_KEY>
X-API-Key: <PAZ_API_KEY>
\`\`\`

In the consuming app, store the key in an environment variable (for example \`PAZ_API_KEY\`) and
the base URL in \`PAZ_API_URL=${api}\`.

## Data model

A **reservation** is a guest stay: one person, one bed, an arrival date and a departure date.

- **Building** contains rooms.
- **Room** has a \`room_type\`: \`private\` | \`double\` | \`triple\` | \`quad\`, and one or more beds.
- **Bed** is the bookable unit. One reservation occupies one bed.
- A bed is **occupied** for a date range when an active reservation overlaps it. Stays use a
  half-open interval \`[arrival_date, departure_date)\`, so a guest can arrive on the day another departs.
- Reservations with status \`cancelled\` or \`checked_out\` do not block a bed.
- Reservation \`status\`: \`upcoming\` | \`checked_in\` | \`staying\` | \`checking_out_today\` | \`checked_out\` | \`cancelled\`.
  New reservations created through the API are always \`upcoming\`.
- \`resident_type\`: \`resident\` | \`volunteer\` | \`retreat\`.
- \`gender\`: \`female\` | \`male\`. \`diet\`: \`eats_all\` | \`vegetarian\` | \`vegan\`.

## How rates are calculated

The server always calculates the price. Clients should display the quote returned by the API and
never send a price.

1. \`nights = departure_date - arrival_date\` (in days).
2. Application type:
   - \`resident_type = volunteer\` → \`volunteer\` rates (regardless of length).
   - otherwise, \`nights < 8\` → \`retreat\` rates; \`nights >= 8\` → \`resident\` rates.
3. Rate rule: the active rule with matching \`application_type\` and exact \`room_type\`; if none,
   the rule with \`room_type = "any"\` for that application type. If nothing matches → \`NO_RATE_FOUND\`.
4. Modifier (only for \`resident\` rates): the active modifier where
   \`min_nights <= nights <= max_nights\` (\`max_nights: null\` = no upper limit).
   - \`percentage\`: \`adjustment = base_nightly_rate * adjustment_value / 100\`
   - \`fixed_amount\`: \`adjustment = adjustment_value\`
   - Negative values are discounts.
5. \`final_nightly_rate = base_nightly_rate + adjustment\`; \`total_cost = final_nightly_rate * nights\`.

## Endpoints

### GET /rooms

Lists rooms with their beds. Pass a date range to get availability.

Query parameters (all optional):

| Name | Description |
| --- | --- |
| \`arrival_date\`, \`departure_date\` | Check availability for this stay. Both required if either is sent. |
| \`room_type\` | Filter: \`private\`, \`double\`, \`triple\`, \`quad\` |
| \`available\` | \`true\` to only return rooms with at least one free bed (needs dates) |

\`\`\`bash
curl "${api}/rooms?arrival_date=2026-12-01&departure_date=2026-12-10&available=true"
\`\`\`

\`\`\`json
{
  "date_range": { "arrival_date": "2026-12-01", "departure_date": "2026-12-10" },
  "availability_checked": true,
  "count": 1,
  "rooms": [
    {
      "id": "6f1c...",
      "name": "Jungle Room",
      "description": "Shared room with garden view",
      "room_type": "quad",
      "is_private": false,
      "building": { "id": "a12b...", "name": "Main House" },
      "total_beds": 4,
      "available_beds": 2,
      "beds": [
        { "id": "b1...", "name": "Bed A", "available": true },
        { "id": "b2...", "name": "Bed B", "available": false }
      ]
    }
  ]
}
\`\`\`

Without dates, every bed reports \`available: true\` and \`availability_checked\` is \`false\`.

### GET /rates

Returns every active rate rule, every active length-of-stay modifier, and the pricing rules above.

\`\`\`bash
curl "${api}/rates"
\`\`\`

\`\`\`json
{
  "pricing_rules": { "...": "plain-language description of the rules" },
  "rates": [
    { "id": "...", "name": "Resident Quad", "application_type": "resident", "room_type": "quad", "base_nightly_rate": 35, "currency": "USD", "notes": null }
  ],
  "modifiers": [
    { "id": "...", "name": "Monthly stay", "min_nights": 28, "max_nights": null, "adjustment_type": "percentage", "adjustment_value": -15, "notes": null }
  ]
}
\`\`\`

### GET /rates/quote

Calculates the exact price for a stay. Use it to show the price before booking.

| Name | Required | Description |
| --- | --- | --- |
| \`arrival_date\` | yes | \`YYYY-MM-DD\` |
| \`departure_date\` | yes | \`YYYY-MM-DD\`, after arrival |
| \`room_type\` or \`room_id\` | one of them | Room type, or a room id (its type is used) |
| \`resident_type\` | no | \`resident\` (default), \`volunteer\`, \`retreat\` |

\`\`\`bash
curl "${api}/rates/quote?arrival_date=2026-12-01&departure_date=2026-12-31&room_type=quad"
\`\`\`

\`\`\`json
{
  "arrival_date": "2026-12-01",
  "departure_date": "2026-12-31",
  "quote": {
    "nights": 30,
    "resident_type": "resident",
    "application_type": "resident",
    "room_type": "quad",
    "rate_name": "Resident Quad",
    "currency": "USD",
    "base_nightly_rate": 35,
    "modifier": { "name": "Monthly stay", "adjustment_type": "percentage", "adjustment_value": -15 },
    "adjustment_per_night": -5.25,
    "final_nightly_rate": 29.75,
    "total_cost": 892.5
  }
}
\`\`\`

### POST /reservations (API key)

Creates a reservation and assigns a bed. The server re-checks availability and calculates the rate.

Choose the bed with **one** of:

- \`bed_id\` — a specific bed (must be free for the dates)
- \`room_id\` — the first free bed in that room
- \`room_type\` — the first free bed in any room of that type

Body:

| Field | Required | Type |
| --- | --- | --- |
| \`name\` | yes | string |
| \`email\` | yes | email |
| \`gender\` | yes | \`female\` \\| \`male\` |
| \`arrival_date\` | yes | \`YYYY-MM-DD\`, today or later |
| \`departure_date\` | yes | \`YYYY-MM-DD\`, after arrival |
| \`bed_id\` / \`room_id\` / \`room_type\` | one of them | uuid / uuid / room type |
| \`resident_type\` | no | \`resident\` (default) \\| \`volunteer\` \\| \`retreat\` |
| \`diet\` | no | \`eats_all\` (default) \\| \`vegetarian\` \\| \`vegan\` |
| \`whatsapp\`, \`nationality\`, \`notes\` | no | string |
| \`age\` | no | integer |
| \`source\` | no | short label of your app, stored in the reservation notes |

\`\`\`bash
curl -X POST "${api}/reservations" \\
  -H "Authorization: Bearer $PAZ_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Ana Rojas",
    "email": "ana@example.com",
    "gender": "female",
    "diet": "vegetarian",
    "arrival_date": "2026-12-01",
    "departure_date": "2026-12-10",
    "room_type": "quad",
    "source": "partner-site"
  }'
\`\`\`

Response \`201\`:

\`\`\`json
{
  "reservation": {
    "id": "c0ffee...",
    "name": "Ana Rojas",
    "email": "ana@example.com",
    "status": "upcoming",
    "resident_type": "resident",
    "arrival_date": "2026-12-01",
    "departure_date": "2026-12-10",
    "nightly_rate": 35,
    "nights": 9,
    "room": { "id": "6f1c...", "name": "Jungle Room", "room_type": "quad", "building": { "id": "a12b...", "name": "Main House" } },
    "bed": { "id": "b1...", "name": "Bed A" }
  },
  "quote": { "nights": 9, "final_nightly_rate": 35, "total_cost": 315, "currency": "USD", "...": "..." }
}
\`\`\`

### GET /reservations (API key)

| Name | Description |
| --- | --- |
| \`from\` | Only stays that end on or after this date |
| \`to\` | Only stays that start on or before this date |
| \`status\` | Filter by status |
| \`email\` | Exact email (case-insensitive) |

Returns up to 500 reservations ordered by arrival date: \`{ "count": 1, "reservations": [ ... ] }\`.

### GET /reservations/{id} (API key)

Returns \`{ "reservation": { ... } }\` or \`404\`.

## Errors

Every error has the same shape:

\`\`\`json
{ "error": { "code": "NO_AVAILABILITY", "message": "No bed is available for the requested dates." } }
\`\`\`

| HTTP | code | Meaning |
| --- | --- | --- |
| 400 | \`INVALID_INPUT\` | Bad dates or body. \`details\` holds field errors. |
| 401 | \`UNAUTHORIZED\` | Missing or wrong API key |
| 404 | \`NOT_FOUND\` | Room, bed or reservation not found |
| 409 | \`NO_AVAILABILITY\` | No free bed for those dates — pick other dates or another room |
| 422 | \`NO_RATE_FOUND\` | No active rate for that room type / stay |
| 503 | \`NOT_CONFIGURED\` | The API key has not been configured on the Paz server |
| 500 | \`INTERNAL_ERROR\` | Unexpected error |

## Recommended booking flow

1. User picks dates → \`GET /rooms?arrival_date=…&departure_date=…&available=true\`.
2. User picks a room (or room type) → \`GET /rates/quote\` and show \`total_cost\` and \`final_nightly_rate\`.
3. User fills in name, email, gender, diet → your **server** calls \`POST /reservations\` with the API key.
4. On \`409\`, refresh availability and ask the user to choose again.
5. Show the returned reservation id, room, bed, dates and total.

## Example: Next.js server helper

\`\`\`ts
// lib/paz.ts (server-only)
const BASE = process.env.PAZ_API_URL!

async function paz<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(\`\${BASE}\${path}\`, {
    ...init,
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      Authorization: \`Bearer \${process.env.PAZ_API_KEY}\`,
      ...init?.headers,
    },
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data?.error?.message ?? 'Paz API error')
  return data as T
}

export const getAvailableRooms = (arrival: string, departure: string) =>
  paz(\`/rooms?arrival_date=\${arrival}&departure_date=\${departure}&available=true\`)

export const getQuote = (arrival: string, departure: string, roomType: string) =>
  paz(\`/rates/quote?arrival_date=\${arrival}&departure_date=\${departure}&room_type=\${roomType}\`)

export const createReservation = (body: Record<string, unknown>) =>
  paz('/reservations', { method: 'POST', body: JSON.stringify(body) })
\`\`\`
`
}
