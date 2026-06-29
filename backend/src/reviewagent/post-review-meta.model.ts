import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PostReviewMetaDocument = PostReviewMeta & Document;

// ── nested comment shape ───────────────────────────────────────────────────

export class MetaComment {
  @Prop({ required: true })
  commentId: string;

  @Prop() authorName: string;
  @Prop() authorInitial: string;
  @Prop() text: string;
  @Prop() createdAt: Date;
  @Prop({ default: 0 }) likeCount: number;
  @Prop({ default: 0 }) replyCount: number;
  @Prop({ type: [Object], default: [] }) replies: Record<string, any>[];
}

// ── root document ──────────────────────────────────────────────────────────

@Schema({ collection: 'post-reviews-meta', timestamps: true })
export class PostReviewMeta {
  @Prop() userId: string;
  @Prop() pageId: string;
  @Prop() pageName: string;
  @Prop() postId: string;
  @Prop() message: string;
  @Prop() title: string;
  @Prop() permalink: string;
  @Prop() thumbnail: string;
  @Prop() postedAt: Date;
  @Prop({ default: 0 }) commentCount: number;

  /** Raw comments array from Meta */
  @Prop({ type: [Object], default: [] })
  comments: MetaComment[];

  /**
   * AI-generated replies stored as a map keyed by commentId.
   *
   * Example:
   * {
   *   "122106288458776881_2567641943696595": {
   *     reply: "Hi Facebook user, Thank you for your kind words!",
   *     generatedAt: ISODate(...)
   *   }
   * }
   */
  @Prop({ type: Object, default: {} })
  'ai-generated': Record<string, { reply: string; generatedAt: Date }>;

  @Prop() syncedAt: Date;
}

export const PostReviewMetaSchema = SchemaFactory.createForClass(PostReviewMeta);