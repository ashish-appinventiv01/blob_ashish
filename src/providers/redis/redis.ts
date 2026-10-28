type PostListKey = { page: number; limit: number; search?: string; tag?: string; sort: string };

export const redisConfig = {
  ttl: { user: 60 * 60, post: 10 * 60, postList: 60, stats: 5 * 60, loginAttempt: 15 * 60 },
  limits: { loginAttempts: 5 },
  keys: {
    session: (token: string) => `session:${token}`,
    userSessions: (userId: string) => `user:${userId}:sessions`,
    user: (userId: string) => `user:${userId}`,
    post: (postId: string) => `post:${postId}`,
    postListVersion: () => "posts:list:version",
    postList: (version: string, query: PostListKey) =>
      `posts:list:v${version}:p${query.page}:l${query.limit}:s${(query.search ?? "").toLowerCase()}:t${(query.tag ?? "").toLowerCase()}:o${query.sort}`,
    stats: () => "stats",
    loginAttempts: (email: string) => `login:fail:${email}`,
  },
};
