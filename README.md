# Wishlists

* TLS would be nice.

# TCP Protocol Definition

1. Connect from client, send up API token
1. Server sends challenge
1. Client signs the challenge with API secret and sends it back
  2. This is the challenge HMAC'd with SHA512, base64 encoded
1. Server sends pushes until client disconnects
  2. Pushes are also HMAC'd

# Server setup

The server is in two pieces.  First is an HTTP server which handles user accounts, frontend, and the API.

The second portion is the push server, which handles client auth and push delivery.

These two are connected by a redis queue or two.

# Push Flow

1. API Endpoint is hit
1. Data is pushed into the delivery queue
1. Push server pops it off, checks for valid clients
  2. If a client (or more) are found, ship it out.
  2. If a client is not found, push it into a failed queue/pile

# Packet Format

    [SHA256 HMAC][MSGPACK] 

## msgpack Body

    {
      "id": 12345,
      "title": "derp",
      "body": "",              // Optional
      "url": "",               // Optional
      "image_url": "",         // Optional
      "timestamp": 123456789
    }

