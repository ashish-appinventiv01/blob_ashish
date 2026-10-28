import { PostModel } from "../../model/post.model";
import { UserModel } from "../../model/user.model";
import { BlogStats } from "./stats.interface";

export type { BlogStats };

type StatsFacet = {
  publishedPosts: Array<{ count: number }>;
  topTags: BlogStats["topTags"];
  topAuthors: BlogStats["topAuthors"];
  mostCommented: BlogStats["mostCommented"];
};

class StatsRepository {
  async getBlogStats(): Promise<BlogStats> {
    const [result] = await PostModel.aggregate<StatsFacet>([
      { $match: { status: "published" } },
      {
        $facet: {
          publishedPosts: [{ $count: "count" }],
          topTags: [
            { $unwind: "$tags" },
            { $group: { _id: "$tags", posts: { $sum: 1 } } },
            { $sort: { posts: -1, _id: 1 } },
            { $limit: 10 },
            { $project: { _id: 0, tag: "$_id", posts: 1 } },
          ],
          topAuthors: [
            { $group: { _id: "$author", posts: { $sum: 1 } } },
            { $sort: { posts: -1, _id: 1 } },
            { $limit: 5 },
            {
              $lookup: {
                from: UserModel.collection.collectionName,
                localField: "_id",
                foreignField: "_id",
                as: "user",
                pipeline: [{ $project: { _id: 0, name: 1 } }],
              },
            },
            { $unwind: "$user" },
            { $project: { _id: 0, name: "$user.name", posts: 1 } },
          ],
          mostCommented: [
            { $sort: { commentCount: -1, createdAt: -1 } },
            { $limit: 5 },
            { $project: { _id: 0, title: 1, commentCount: 1 } },
          ],
        },
      },
    ]);

    return {
      publishedPosts: result?.publishedPosts[0]?.count ?? 0,
      topTags: result?.topTags ?? [],
      topAuthors: result?.topAuthors ?? [],
      mostCommented: result?.mostCommented ?? [],
    };
  }
}

export const statsRepository = new StatsRepository();
