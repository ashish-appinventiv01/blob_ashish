export const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "Blog API",
    version: "1.0.0",
    description:
      "Signup and login first. Login sets an httpOnly cookie named token. From this page, use Try it out on POST /api/auth/login, then call protected routes in the same browser. The cookie is sent automatically.",
  },
  servers: [{ url: "/" }],
  tags: [
    { name: "Health" },
    { name: "Auth" },
    { name: "Users" },
    { name: "Posts" },
    { name: "Comments" },
    { name: "Stats" },
  ],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: "apiKey",
        in: "cookie",
        name: "token",
      },
    },
    schemas: {
      Error: {
        type: "object",
        required: ["success", "message"],
        properties: {
          success: { type: "boolean", example: false },
          message: { type: "string" },
        },
      },
      SuccessMessage: {
        type: "object",
        required: ["success", "message"],
        properties: {
          success: { type: "boolean", example: true },
          message: { type: "string" },
        },
      },
      User: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          email: { type: "string", format: "email" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      SignupRequest: {
        type: "object",
        required: ["name", "email", "password"],
        properties: {
          name: { type: "string", minLength: 2, maxLength: 50, example: "Ashish" },
          email: { type: "string", format: "email", example: "ashish@example.com" },
          password: { type: "string", minLength: 8, format: "password", example: "password123" },
        },
      },
      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email", example: "ashish@example.com" },
          password: { type: "string", format: "password", example: "password123" },
        },
      },
      LoginResponse: {
        type: "object",
        properties: {
          token: { type: "string" },
          user: { $ref: "#/components/schemas/User" },
        },
      },
      UpdateNameRequest: {
        type: "object",
        required: ["name"],
        properties: {
          name: { type: "string", minLength: 2, maxLength: 50, example: "Ashish Sharma" },
        },
      },
      Post: {
        type: "object",
        properties: {
          _id: { type: "string" },
          title: { type: "string" },
          body: { type: "string" },
          tags: { type: "array", items: { type: "string" } },
          author: { type: "string" },
          authorName: { type: "string" },
          status: { type: "string", enum: ["draft", "published"] },
          commentCount: { type: "integer" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      PostSummary: {
        type: "object",
        properties: {
          _id: { type: "string" },
          title: { type: "string" },
          tags: { type: "array", items: { type: "string" } },
          author: { type: "string" },
          authorName: { type: "string" },
          status: { type: "string", enum: ["draft", "published"] },
          commentCount: { type: "integer" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      CreatePostRequest: {
        type: "object",
        required: ["title", "body"],
        properties: {
          title: { type: "string", minLength: 5, maxLength: 120, example: "My first post" },
          body: { type: "string", minLength: 20, example: "This body is long enough to publish." },
          tags: {
            type: "array",
            maxItems: 5,
            items: { type: "string" },
            example: ["node", "mongo"],
          },
          status: { type: "string", enum: ["draft", "published"], default: "draft" },
        },
      },
      UpdatePostRequest: {
        type: "object",
        properties: {
          title: { type: "string", minLength: 5, maxLength: 120 },
          body: { type: "string", minLength: 20 },
          tags: { type: "array", maxItems: 5, items: { type: "string" } },
          status: { type: "string", enum: ["draft", "published"] },
        },
      },
      Pagination: {
        type: "object",
        properties: {
          page: { type: "integer", example: 1 },
          limit: { type: "integer", example: 10 },
          total: { type: "integer", example: 57 },
          totalPages: { type: "integer", example: 6 },
        },
      },
      PostListResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          data: { type: "array", items: { $ref: "#/components/schemas/PostSummary" } },
          pagination: { $ref: "#/components/schemas/Pagination" },
        },
      },
      Comment: {
        type: "object",
        properties: {
          _id: { type: "string" },
          postId: { type: "string" },
          userId: { type: "string" },
          userName: { type: "string" },
          text: { type: "string" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      CreateCommentRequest: {
        type: "object",
        required: ["text"],
        properties: {
          text: { type: "string", minLength: 1, maxLength: 500, example: "Nice post" },
        },
      },
      CommentListResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          data: { type: "array", items: { $ref: "#/components/schemas/Comment" } },
          pagination: { $ref: "#/components/schemas/Pagination" },
        },
      },
      Stats: {
        type: "object",
        properties: {
          publishedPosts: { type: "integer" },
          topTags: {
            type: "array",
            items: {
              type: "object",
              properties: {
                tag: { type: "string" },
                posts: { type: "integer" },
              },
            },
          },
          topAuthors: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                posts: { type: "integer" },
              },
            },
          },
          mostCommented: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                commentCount: { type: "integer" },
              },
            },
          },
        },
      },
    },
    parameters: {
      Page: {
        name: "page",
        in: "query",
        schema: { type: "integer", minimum: 1, default: 1 },
      },
      Limit: {
        name: "limit",
        in: "query",
        schema: { type: "integer", minimum: 1, maximum: 50, default: 10 },
      },
      PostId: {
        name: "id",
        in: "path",
        required: true,
        schema: { type: "string", example: "507f1f77bcf86cd799439011" },
      },
    },
  },
  paths: {
    "/api/health": {
      get: {
        tags: ["Health"],
        summary: "Health check",
        responses: {
          "200": {
            description: "Server is running",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { status: { type: "string", example: "ok" } },
                },
              },
            },
          },
        },
      },
    },
    "/api/auth/signup": {
      post: {
        tags: ["Auth"],
        summary: "Create an account",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/SignupRequest" } } },
        },
        responses: {
          "201": {
            description: "User created",
            content: { "application/json": { schema: { $ref: "#/components/schemas/User" } } },
          },
          "400": { description: "Invalid name, email, or password", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "409": { description: "Email already registered", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },
    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Log in and receive a session cookie",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/LoginRequest" } } },
        },
        responses: {
          "200": {
            description: "Logged in. Sets the token cookie.",
            content: { "application/json": { schema: { $ref: "#/components/schemas/LoginResponse" } } },
          },
          "400": { description: "Email or password missing", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "401": { description: "Invalid email or password", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },
    "/api/auth/logout": {
      post: {
        tags: ["Auth"],
        summary: "Delete the current session",
        security: [{ cookieAuth: [] }],
        responses: {
          "200": { description: "Logged out", content: { "application/json": { schema: { $ref: "#/components/schemas/SuccessMessage" } } } },
          "401": { description: "Not logged in", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },
    "/api/users/me": {
      get: {
        tags: ["Users"],
        summary: "Get the logged-in user",
        security: [{ cookieAuth: [] }],
        responses: {
          "200": { description: "Current user", content: { "application/json": { schema: { $ref: "#/components/schemas/User" } } } },
          "401": { description: "Not logged in", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
      patch: {
        tags: ["Users"],
        summary: "Update the logged-in user's name",
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/UpdateNameRequest" } } },
        },
        responses: {
          "200": { description: "Updated user", content: { "application/json": { schema: { $ref: "#/components/schemas/User" } } } },
          "400": { description: "Invalid name", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "401": { description: "Not logged in", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },
    "/api/users/me/posts": {
      get: {
        tags: ["Users"],
        summary: "List the logged-in user's posts, including drafts",
        security: [{ cookieAuth: [] }],
        responses: {
          "200": {
            description: "Own posts",
            content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Post" } } } },
          },
          "401": { description: "Not logged in", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },
    "/api/posts": {
      get: {
        tags: ["Posts"],
        summary: "List published posts",
        parameters: [
          { $ref: "#/components/parameters/Page" },
          { $ref: "#/components/parameters/Limit" },
          { name: "search", in: "query", description: "Case-insensitive title search", schema: { type: "string" } },
          { name: "tag", in: "query", description: "Filter by one tag", schema: { type: "string" } },
          {
            name: "sort",
            in: "query",
            schema: { type: "string", enum: ["newest", "oldest", "mostCommented"], default: "newest" },
          },
        ],
        responses: {
          "200": { description: "Published posts without the body", content: { "application/json": { schema: { $ref: "#/components/schemas/PostListResponse" } } } },
          "400": { description: "Invalid page, limit, or sort", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
      post: {
        tags: ["Posts"],
        summary: "Create a post",
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/CreatePostRequest" } } },
        },
        responses: {
          "201": { description: "Post created", content: { "application/json": { schema: { $ref: "#/components/schemas/Post" } } } },
          "400": { description: "Invalid post", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "401": { description: "Not logged in", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },
    "/api/posts/{id}": {
      get: {
        tags: ["Posts"],
        summary: "Get one published post",
        parameters: [{ $ref: "#/components/parameters/PostId" }],
        responses: {
          "200": { description: "Published post", content: { "application/json": { schema: { $ref: "#/components/schemas/Post" } } } },
          "400": { description: "Invalid id", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "404": { description: "Post not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
      patch: {
        tags: ["Posts"],
        summary: "Update a post you wrote",
        security: [{ cookieAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/PostId" }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/UpdatePostRequest" } } },
        },
        responses: {
          "200": { description: "Updated post", content: { "application/json": { schema: { $ref: "#/components/schemas/Post" } } } },
          "400": { description: "Invalid id or body", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "401": { description: "Not logged in", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "403": { description: "Not the author", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "404": { description: "Post not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
      delete: {
        tags: ["Posts"],
        summary: "Delete a post you wrote, and its comments",
        security: [{ cookieAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/PostId" }],
        responses: {
          "200": { description: "Post deleted", content: { "application/json": { schema: { $ref: "#/components/schemas/SuccessMessage" } } } },
          "400": { description: "Invalid id", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "401": { description: "Not logged in", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "403": { description: "Not the author", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "404": { description: "Post not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },
    "/api/posts/{id}/comments": {
      get: {
        tags: ["Comments"],
        summary: "List comments on a published post",
        parameters: [
          { $ref: "#/components/parameters/PostId" },
          { $ref: "#/components/parameters/Page" },
          { $ref: "#/components/parameters/Limit" },
        ],
        responses: {
          "200": { description: "Comments, newest first", content: { "application/json": { schema: { $ref: "#/components/schemas/CommentListResponse" } } } },
          "400": { description: "Invalid id, page, or limit", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "404": { description: "Published post not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
      post: {
        tags: ["Comments"],
        summary: "Comment on a published post",
        security: [{ cookieAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/PostId" }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/CreateCommentRequest" } } },
        },
        responses: {
          "201": { description: "Comment created", content: { "application/json": { schema: { $ref: "#/components/schemas/Comment" } } } },
          "400": { description: "Invalid id or text", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "401": { description: "Not logged in", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "404": { description: "Published post not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },
    "/api/comments/{id}": {
      delete: {
        tags: ["Comments"],
        summary: "Delete a comment you wrote, or a comment on your post",
        security: [{ cookieAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/PostId" }],
        responses: {
          "200": { description: "Comment deleted", content: { "application/json": { schema: { $ref: "#/components/schemas/SuccessMessage" } } } },
          "400": { description: "Invalid id", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "401": { description: "Not logged in", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "403": { description: "Not allowed to delete this comment", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "404": { description: "Comment not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },
    "/api/stats": {
      get: {
        tags: ["Stats"],
        summary: "Published-post statistics",
        responses: {
          "200": { description: "Totals, top tags, top authors, and most-commented posts", content: { "application/json": { schema: { $ref: "#/components/schemas/Stats" } } } },
        },
      },
    },
  },
};
