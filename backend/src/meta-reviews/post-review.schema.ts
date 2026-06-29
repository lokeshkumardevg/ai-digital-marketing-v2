import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PostReviewDocument = PostReview & Document;

// ─── Reply (nested inside Comment) ───────────────────────────────────────────
@Schema({ _id: false })
export class PostReply {
  @Prop({ required: true }) replyId: string;
  @Prop() authorName: string;
  @Prop() authorInitial: string;
  @Prop() text: string;
  @Prop() createdAt: string;
  @Prop({ default: 0 }) likeCount: number;
}
export const PostReplySchema = SchemaFactory.createForClass(PostReply);

// ─── Comment (nested inside PostReview) ──────────────────────────────────────
@Schema({ _id: false })
export class PostComment {
  @Prop({ required: true }) commentId: string;
  @Prop() authorName: string;
  @Prop() authorInitial: string;
  @Prop() text: string;
  @Prop() createdAt: string;
  @Prop({ default: 0 }) likeCount: number;
  @Prop({ default: 0 }) replyCount: number;

  // Fetched replies stored inline
  @Prop({ type: [PostReplySchema], default: [] })
  replies: PostReply[];
}
export const PostCommentSchema = SchemaFactory.createForClass(PostComment);

// ─── PostReview (top-level document) ─────────────────────────────────────────
@Schema({ collection: 'post-reviews-meta', timestamps: true })
export class PostReview {
  // ── Page info ──────────────────────────────────────────────────────────────
  @Prop({ required: true, index: true }) userId: string;
  @Prop({ required: true, index: true }) pageId: string;
  @Prop() pageName: string;

  // ── Post info ──────────────────────────────────────────────────────────────
  @Prop({ required: true, unique: true }) postId: string; // Facebook post id
  @Prop() message: string;
  @Prop() title: string;         // first 80 chars of message
  @Prop() permalink: string;
  @Prop() thumbnail: string;
  @Prop() postedAt: string;      // Facebook created_time

  // ── Engagement counts ──────────────────────────────────────────────────────
  @Prop({ default: 0 }) commentCount: number;

  // ── Nested comments + replies ──────────────────────────────────────────────
  @Prop({ type: [PostCommentSchema], default: [] })
  comments: PostComment[];

  // ── Sync metadata ──────────────────────────────────────────────────────────
  @Prop({ default: null }) syncedAt: Date;   // last time this doc was synced
}

export const PostReviewSchema = SchemaFactory.createForClass(PostReview);

// Compound index for fast page-level queries
PostReviewSchema.index({ userId: 1, pageId: 1 });
PostReviewSchema.index({ userId: 1, pageId: 1, syncedAt: -1 });