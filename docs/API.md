# API Documentation

## Authentication

All API endpoints require authentication via Clerk. Include the user's authentication token in requests.

## Base URL

```
https://your-domain.com/api
```

## Endpoints

### Listings

#### GET /api/listings

Get all active listings with optional filters.

**Query Parameters:**

- `status` (optional): Filter by status (`active`, `sold`, `inactive`)
- `listing_type` (optional): Filter by type (`fixed`, `auction`, `trade`)
- `limit` (optional): Number of results (default: 50)
- `offset` (optional): Pagination offset

**Response:**

```json
{
  "listings": [
    {
      "id": "uuid",
      "seller_id": "uuid",
      "game_id": "uuid",
      "listing_type": "fixed",
      "price": 25.0,
      "currency": "EUR",
      "condition": "very_good",
      "location_city": "Tallinn",
      "photos": ["url1", "url2"],
      "description": { "en": "Description" },
      "status": "active",
      "created_at": "2024-01-01T00:00:00Z",
      "users": { "username": "seller" },
      "games": { "title": { "en": "Game Title" } }
    }
  ]
}
```

#### POST /api/listings/create

Create a new listing.

**Request Body:**

```json
{
  "gameTitle": "Catan",
  "gameId": "uuid",
  "listingType": "fixed",
  "price": "25.00",
  "currency": "EUR",
  "condition": "very_good",
  "locationCity": "Tallinn",
  "description": "Used Catan game in good condition",
  "images": ["base64_image1", "base64_image2"],
  "shippingOptions": {
    "omniva": true,
    "dpd": true,
    "pickup": true
  }
}
```

**Response:**

```json
{
  "success": true,
  "listing": {
    /* listing object */
  },
  "listingType": "fixed"
}
```

#### GET /api/listings/[id]

Get a specific listing by ID.

**Response:**

```json
{
  "listing": {
    "id": "uuid",
    "seller_id": "uuid",
    "game_id": "uuid",
    "listing_type": "fixed",
    "price": 25.0,
    "currency": "EUR",
    "condition": "very_good",
    "location_city": "Tallinn",
    "photos": ["url1", "url2"],
    "description": { "en": "Description" },
    "status": "active",
    "created_at": "2024-01-01T00:00:00Z",
    "users": { "username": "seller", "location_city": "Tallinn" },
    "games": { "title": { "en": "Game Title" } }
  }
}
```

#### PUT /api/listings/[id]

Update a listing (owner only).

**Request Body:** Same as POST /api/listings/create

**Response:**

```json
{
  "listing": {
    /* updated listing object */
  }
}
```

#### DELETE /api/listings/[id]

Delete a listing (owner only).

**Response:**

```json
{
  "success": true
}
```

### Auctions

#### GET /api/auctions

Get all active auctions.

**Query Parameters:**

- `status` (optional): Filter by status (`active`, `ended`, `cancelled`)
- `limit` (optional): Number of results (default: 20)
- `offset` (optional): Pagination offset

**Response:**

```json
{
  "auctions": [
    {
      "id": "uuid",
      "starting_price": 10.0,
      "current_price": 15.0,
      "reserve_price": 8.0,
      "bid_increment": 1.0,
      "end_time": "2024-01-10T00:00:00Z",
      "buy_now_price": 30.0,
      "status": "active",
      "bid_count": 3,
      "listings": {
        "id": "uuid",
        "photos": ["url1"],
        "description": { "en": "Description" },
        "users": { "username": "seller" },
        "games": { "title": { "en": "Game Title" } }
      }
    }
  ]
}
```

#### GET /api/auctions/[id]

Get a specific auction by ID.

**Response:**

```json
{
  "auction": {
    "id": "uuid",
    "starting_price": 10.0,
    "current_price": 15.0,
    "reserve_price": 8.0,
    "bid_increment": 1.0,
    "end_time": "2024-01-10T00:00:00Z",
    "buy_now_price": 30.0,
    "status": "active",
    "bid_count": 3,
    "listings": {
      "id": "uuid",
      "photos": ["url1"],
      "description": { "en": "Description" },
      "users": { "username": "seller" },
      "games": { "title": { "en": "Game Title" } }
    }
  }
}
```

#### PUT /api/auctions/[id]

Update an auction (owner only, no bids allowed).

**Request Body:**

```json
{
  "starting_price": 10.0,
  "reserve_price": 8.0,
  "bid_increment": 1.0,
  "end_time": "2024-01-10T00:00:00Z",
  "buy_now_price": 30.0
}
```

#### DELETE /api/auctions/[id]

Delete an auction (owner only, no bids allowed).

### Bidding

#### POST /api/auctions/bid

Place a bid on an auction.

**Request Body:**

```json
{
  "auctionId": "uuid",
  "amount": 16.0
}
```

**Response:**

```json
{
  "success": true,
  "bid": {
    "id": "uuid",
    "auction_id": "uuid",
    "bidder_id": "uuid",
    "amount": 16.0,
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

#### POST /api/auctions/buy-now

Buy an auction immediately.

**Request Body:**

```json
{
  "auctionId": "uuid"
}
```

### Games

#### GET /api/games/search

Search for games by title.

**Query Parameters:**

- `q` (required): Search query

**Response:**

```json
{
  "games": [
    {
      "id": "uuid",
      "title": {
        "en": "Catan",
        "et": "Catan",
        "lv": "Catan",
        "lt": "Catan"
      }
    }
  ]
}
```

### User Profile

#### GET /api/profile

Get current user's profile.

**Response:**

```json
{
  "profile": {
    "id": "uuid",
    "clerk_id": "user_xxx",
    "username": "username",
    "email": "user@example.com",
    "location_city": "Tallinn",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

#### PUT /api/profile

Update user profile.

**Request Body:**

```json
{
  "username": "new_username",
  "location_city": "Tallinn",
  "location_country": "EE"
}
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

Common error codes:

- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not found
- `400`: Bad request
- `500`: Internal server error

## Rate Limiting

API endpoints are rate-limited to prevent abuse:

- 100 requests per minute per user
- 1000 requests per hour per user

## Authentication

Include the user's authentication token in the Authorization header:

```
Authorization: Bearer <token>
```
