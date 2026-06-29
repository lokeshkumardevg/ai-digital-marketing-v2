import { Schema, Document } from 'mongoose';

const ReplySchema = new Schema(
  {
    replyId: String,
    authorName: String,
    authorInitial: String,
    text: String,
    createdAt: Date,
    likeCount: { type: Number, default: 0 },
  },
  { _id: false },
);

const CommentSchema = new Schema(
  {
    commentId: String,
    authorName: String,
    authorInitial: String,
    text: String,
    createdAt: Date,
    likeCount: { type: Number, default: 0 },
    replyCount: { type: Number, default: 0 },
    replies: { type: [ReplySchema], default: [] },
  },
  { _id: false },
);

export const PostReviewMetaSchema = new Schema(
  {
    userId: String,
    pageId: String,
    pageName: String,
    postId: String,
    message: String,
    title: String,
    permalink: String,
    thumbnail: String,
    postedAt: Date,
    commentCount: Number,
    comments: { type: [CommentSchema], default: [] },
    syncedAt: Date,
    'ai-generated': { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true, collection: 'post-reviews-meta' },
);

export interface PostReviewMeta extends Document {
  userId: string;
  pageId: string;
  pageName: string;
  postId: string;
  comments: any[];
  brandId : string;
}