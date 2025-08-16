# Unwrapped

A Web3 wrapped card generator with Redis caching.

## Features

- Generate wrapped cards for different generator types
- Redis caching for improved performance
- Smooth animations and transitions
- Support for multiple card types

## Environment Variables

### Redis Configuration
```bash
# Redis connection URL (optional, defaults to localhost:6379)
REDIS_URL=redis://localhost:6379

# For production, you might use:
REDIS_URL=redis://username:password@host:port
```

### App Configuration
```bash
# Your app's public URL (required for server-side redirects)
NEXT_PUBLIC_APP_URL=https://yourapp.com

# For local development:
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Redis Caching

The application uses Redis to cache generated cards for 24 hours. This improves performance by:

- Avoiding regeneration of the same cards
- Reducing API calls to external services
- Providing faster response times for repeated requests

### Cache Key Format
```
card:{generatorId}:{address}
```

Example: `card:top-tokens:0x1234567890abcdef1234567890abcdef12345678`

### Cache Functions

- `storeCard(generatorId, address, card)` - Stores a generated card
- `getCard(generatorId, address)` - Retrieves a cached card
- `isRedisAvailable()` - Checks if Redis is configured

## Development

```bash
# Install dependencies
bun install

# Start development server
bun dev

# Build for production
bun build
```

## API Endpoints

### POST /api/test-generator
Test a single generator with caching support.

**Request Body:**
```json
{
  "address": "0x1234567890abcdef1234567890abcdef12345678",
  "generatorId": "top-tokens"
}
```

**Response:**
```json
{
  "success": true,
  "generatorId": "top-tokens",
  "address": "0x1234567890abcdef1234567890abcdef12345678",
  "card": { ... },
  "timestamp": "2024-01-01T00:00:00.000Z",
  "cached": false
}
```

The `cached` field indicates whether the result was retrieved from cache (`true`) or newly generated (`false`).
