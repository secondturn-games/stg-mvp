# Implementing BoardGameGeek-Based Game Selection & Metadata Flow

## Overview

This document outlines how to implement a board game selection and metadata retrieval flow for the Second Turn Games marketplace using BoardGameGeek's XML API2.

## User Flow

1. User enters a game name.
2. User selects a game from the list of results.
3. User selects a specific version/edition.
4. User chooses a display name (primary or alternate).
5. A game card is shown with detailed metadata.

## 1. Searching for Games by Name

**Endpoint:**

```
GET https://boardgamegeek.com/xmlapi2/search?query=QUERY&type=boardgame,boardgameexpansion
```

- Use `type=boardgame,boardgameexpansion` to get both base games and expansions.
- Optional: `exact=1` for precise matches.

**Returned Data:**

- Game ID
- Name (primary)
- Year published

## 2. Retrieving Game Details

**Endpoint:**

```
GET https://boardgamegeek.com/xmlapi2/thing?id=GAME_ID&stats=1&versions=1
```

- `stats=1`: Includes rating and ranking
- `versions=1`: Includes all known versions/editions

**Returned Data:**

- Names (primary and alternate)
- Year published
- Player count (min/max)
- Playing time (min/max)
- Designers and artists
- Mechanics and categories
- Ratings and ranks
- Expansions

## 3. Displaying Available Versions

**Available via** `<versions>` section in response. Each version contains:

- Nickname/title
- Publisher
- Year
- Language(s)
- Box dimensions (length, width, height)
- Weight

**Notes:**

- Not all versions have full metadata (e.g., dimensions may be missing).
- Display versions using a format like: `Catan – English Edition (Mayfair, 2015)`

## 4. Choosing Display Name

**From:** `<name>` elements

- `type="primary"` or `type="alternate"`

**Notes:**

- No language code is provided.
- If necessary, infer preferred name by matching with version's language.

## 5. Game Card Metadata

Display the following on the final seller-facing card:

### Selected Name

- User-chosen primary or alternate name

### Version Details

- Publisher
- Year
- Language(s)
- Box size (if available)

### Game Metadata

- Player count
- Play time
- Designers
- Artists
- Mechanics
- Categories
- BGG Rank
- BGG Rating (average)

### Expansions

- List from `<link type="boardgameexpansion">`
- Only include names and optionally years

## Implementation Considerations

### API Rate Limits

- Wait \~5 seconds between requests to avoid HTTP 503 errors
- Cache results whenever possible

### Data Completeness

- Some entries may lack dimensions, alternate names, or versions
- Fallback to manual input or defaults as needed

### Alternate Search Strategy

- Use BGG's game CSV dump for local autocomplete
- Only call API when a specific game is selected

### No CORS Support

- Do not call BGG API from client-side code
- Use backend proxy to handle API requests

### Optional APIs

- BoardGameAtlas API (faster JSON, not as complete)

## Summary

BoardGameGeek's XML API2 supports all the required functionality to:

- Search games
- Retrieve detailed info
- Enumerate versions
- Extract alternate names
- Provide expansions

With caching and rate limit handling, this flow can power a smooth and complete seller-side listing experience.

---

**Sources:**

- BGG API Docs
- BGG Developer Guild
- Reddit r/boardgames discussions on API use
- Community documentation and example implementations

