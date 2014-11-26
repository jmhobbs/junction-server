# Wishlists

* TLS would be nice.

# TCP Protocol Definition

1. Connect from client, send up API token
1. Server sends challenge
1. Client signs the challenge with API secret and sends it back
  2. This is the challenge HMAC'd with SHA512, base64 encoded
1. Server sends pushes until client disconnects
  2. Pushes are also HMAC'd
