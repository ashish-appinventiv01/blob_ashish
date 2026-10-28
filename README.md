# Blog API

Express API for users, posts, comments, and blog statistics. MongoDB is the source of truth. Redis stores sessions, a login-attempt counter, and short-lived copies of read responses.

## Run

Copy `.env.example` to `.env` and set `PORT`, `MONGODB_URI`, `DB_NAME`, and `REDIS_URL`.

```bash
npm install
npm run dev
```

API docs are at `http://localhost:3000/api-docs` when `PORT` is 3000.

## Redis keys

Cached GET responses send `X-Cache: HIT` or `X-Cache: MISS`. The body is the same either way. Writes update MongoDB first, then delete the related Redis key. Values are never patched in place. Every key has a TTL except `posts:list:version`. If a Redis command fails, the error is logged and the request continues with MongoDB. The login rate limit is the one check that is skipped when Redis is down. Passwords are never written to Redis or returned in a response.

| Key | Type | TTL | Set when | Deleted when |
| --- | --- | --- | --- | --- |
| `session:<token>` | String (`userId`) | Seconds left until `expiresAt` | Login. Also when auth finds a valid MongoDB session that is missing from Redis | Logout, logout-all |
| `user:<userId>:sessions` | Set of tokens | Remaining life of the longest session in the set | Login adds the token (same refill path as `session:<token>`) | Logout removes that token and deletes the set when it is empty. Logout-all clears the set after deleting each `session:<token>` |
| `user:<userId>` | String (JSON profile, no password) | 1 hour | `GET /api/users/me` cache miss | `PATCH /api/users/me` |
| `login:fail:<email>` | String counter | 15 minutes, set on the first failure | Each failed login (`INCR`) | Successful login |
| `post:<id>` | String (JSON) | 10 minutes | `GET /api/posts/:id` miss, and only when the post is published | `PATCH /api/posts/:id`, `DELETE /api/posts/:id`, comment added, comment deleted |
| `posts:list:version` | String integer | None | `INCR` when any post is created, updated, deleted, or its `commentCount` changes | Left in place. Old list keys stop matching and expire on their own |
| `posts:list:v<version>:p<page>:l<limit>:s<search>:t<tag>:o<sort>` | String (JSON response) | 60 seconds | `GET /api/posts` cache miss. Defaults are applied first, and search/tag are lowercased, so `/api/posts` and `/api/posts?page=1&limit=10` share one key | Not deleted. A version bump makes the key unused, then the TTL removes it |
| `stats` | String (JSON) | 5 minutes | `GET /api/stats` cache miss | Expires on its own |

`GET /api/users/me/posts` is not cached.

## Why statistics can be 5 minutes old

`GET /api/stats` is a summary: published-post count, top tags, top authors, and the most-commented posts. Those figures are not used to allow or deny a write, and they are not someone's private profile. Counting them walks the posts collection, so the API runs that aggregation at most once every five minutes and reuses the stored result for everyone else. A reader can see a total that is a few minutes behind a new post or comment. The post and list caches are cleared as soon as that data changes, so a post page and the post list show the new `commentCount` on the next read. The summary is the view that is allowed to lag.
