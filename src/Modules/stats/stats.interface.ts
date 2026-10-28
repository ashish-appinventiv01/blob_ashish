export interface TagStat {
  tag: string;
  posts: number;
}

export interface AuthorStat {
  name: string;
  posts: number;
}

export interface CommentedPostStat {
  title: string;
  commentCount: number;
}

export interface BlogStats {
  publishedPosts: number;
  topTags: TagStat[];
  topAuthors: AuthorStat[];
  mostCommented: CommentedPostStat[];
}
