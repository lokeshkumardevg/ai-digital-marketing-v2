import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PostReview, PostReviewDocument } from './post-review.schema';

@Injectable()
export class PostReviewQueryService {
  constructor(
    @InjectModel(PostReview.name)
    private postReviewModel: Model<PostReviewDocument>,
  ) {}

  // ─────────────────────────────────────────────────────────────────────────
  // Get paginated posts for a page (no comments — lightweight list)
  // ─────────────────────────────────────────────────────────────────────────
async getPostsByPage(
  userId: string,
  pageId: string,
  page = 1,
  limit = 10,
  search?: string,
) {
  const skip = (page - 1) * limit;

  const filter: any = { userId, pageId };
  if (search?.trim()) {
    filter.message = { $regex: search.trim(), $options: 'i' };
  }

  const [posts, total] = await Promise.all([
    this.postReviewModel
      .find(filter)
      // ❌ HATA DO: .select('-comments')
      .sort({ postedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    this.postReviewModel.countDocuments(filter),
  ]);

  return {
    data: posts,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

  // ─────────────────────────────────────────────────────────────────────────
  // Get a single post with ALL comments + replies
  // ─────────────────────────────────────────────────────────────────────────
  async getPostById(userId: string, postId: string) {
    const post = await this.postReviewModel
      .findOne({ userId, postId })
      .lean();

    if (!post) {
      throw new NotFoundException(
        `Post ${postId} not found. Please sync first.`,
      );
    }

    return post;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Get all comments (flat) across all posts for a page
  // Useful for inbox/comments feed view
  // ─────────────────────────────────────────────────────────────────────────
  async getCommentsByPage(
    userId: string,
    pageId: string,
    page = 1,
    limit = 20,
    search?: string,
  ) {
    const skip = (page - 1) * limit;

    // Aggregation to unwind comments from all posts of this page
    const matchStage: any = { userId, pageId };

    const pipeline: any[] = [
      { $match: matchStage },
      { $unwind: '$comments' },
      // Optional search on comment text
      ...(search?.trim()
        ? [
            {
              $match: {
                'comments.text': { $regex: search.trim(), $options: 'i' },
              },
            },
          ]
        : []),
      {
        $project: {
          _id: 0,
          postId: 1,
          pageId: 1,
          pageName: 1,
          postMessage: '$title',
          postThumbnail: '$thumbnail',
          comment: '$comments',
        },
      },
      { $sort: { 'comment.createdAt': -1 } },
    ];

    // Count total before pagination
    const countPipeline = [...pipeline, { $count: 'total' }];
    const countResult = await this.postReviewModel.aggregate(countPipeline);
    const total = countResult[0]?.total ?? 0;

    // Paginated result
    const data = await this.postReviewModel.aggregate([
      ...pipeline,
      { $skip: skip },
      { $limit: limit },
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Get aggregate stats for a page from DB
  // ─────────────────────────────────────────────────────────────────────────
  async getPageStats(userId: string, pageId: string) {
    const result = await this.postReviewModel.aggregate([
      { $match: { userId, pageId } },
      {
        $group: {
          _id: null,
          totalPosts: { $sum: 1 },
          totalComments: { $sum: '$commentCount' },
          totalReplies: {
            $sum: {
              $reduce: {
                input: '$comments',
                initialValue: 0,
                in: { $add: ['$$value', { $size: '$$this.replies' }] },
              },
            },
          },
          lastSyncedAt: { $max: '$syncedAt' },
          pageName: { $first: '$pageName' },
        },
      },
      {
        $project: {
          _id: 0,
          pageId: { $literal: pageId },
          pageName: 1,
          totalPosts: 1,
          totalComments: 1,
          totalReplies: 1,
          lastSyncedAt: 1,
        },
      },
    ]);

    return result[0] ?? {
      pageId,
      pageName: null,
      totalPosts: 0,
      totalComments: 0,
      totalReplies: 0,
      lastSyncedAt: null,
    };
  }
}