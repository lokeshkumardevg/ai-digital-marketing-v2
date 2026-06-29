import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import OpenAI from 'openai';

import { ReviewAgent, ReviewAgentDocument } from './reviewagent.model';
import { Recommendation, RecommendationDocument } from './recommendation.model';
import { PostReviewMeta, PostReviewMetaDocument } from './post-review-meta.model';

// ── types ──────────────────────────────────────────────────────────────────

export interface AnalysisResult {
  sentiment: string;
  issues: string[];
  recommendations: string[];
}

/** Which platform's reviews to process */
export type ReviewSource = 'google' | 'meta' | 'all';

// ── service ────────────────────────────────────────────────────────────────

@Injectable()
export class ReviewAgentService {
  private readonly logger = new Logger(ReviewAgentService.name);
  private readonly openai: OpenAI;

  constructor(
    @InjectModel(ReviewAgent.name)
    private readonly reviewModel: Model<ReviewAgentDocument>,

    @InjectModel(Recommendation.name)
    private readonly recommendationModel: Model<RecommendationDocument>,

    @InjectModel(PostReviewMeta.name)
    private readonly metaModel: Model<PostReviewMetaDocument>,
  ) {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  // ═══════════════════════════════════════════════════════════════════════
  //  SHARED HELPERS
  // ═══════════════════════════════════════════════════════════════════════

  async checkCounts() {
    const total      = await this.reviewModel.countDocuments({});
    const lowRating  = await this.reviewModel.countDocuments({ rating: { $lte: 3 } });
    const pending    = await this.reviewModel.countDocuments({ status: 'pending' });
    const metaPosts  = await this.metaModel.countDocuments({});

    return {
      google: { total_records: total, low_rating_records: lowRating, pending_records: pending },
      meta:   { total_posts: metaPosts },
    };
  }

  // ═══════════════════════════════════════════════════════════════════════
  //  AGENT 1-A  ·  GOOGLE — reply generator (unchanged logic)
  // ═══════════════════════════════════════════════════════════════════════

  private async buildGoogleReplyPrompt(record: ReviewAgentDocument): Promise<string> {
    const comment = record.comment?.trim() || 'No comment provided.';
    const user    = record.reviewerName;

    return `
You are a customer support representative writing SHORT replies to Google reviews.

Customer Rating: ${record.rating}/5
Customer Review: ${comment}

STRICT RULES:
- Start with "Hi ${user},"
- Then ONE sentence only. Maximum 15 words after the greeting.
- Start the sentence with "Thank you" for ratings 4-5.
- Start the sentence with "We're sorry" for ratings 1-3.
- Pick ONE specific detail from the review to reference.
- If the review is empty or vague, keep it short and generic.
- NO long paragraphs. NO multiple sentences. NO sign-offs.

Return only the single short reply, nothing else.
`;
  }

  private async generateGoogleReply(record: ReviewAgentDocument): Promise<string> {
    const prompt   = await this.buildGoogleReplyPrompt(record);
    const response = await this.openai.chat.completions.create({
      model:      'gpt-4o-mini',
      messages:   [{ role: 'user', content: prompt }],
      max_tokens: 60,
      temperature: 0.3,
    });
    return response.choices[0].message?.content?.trim() ?? '';
  }

  /** Process ALL pending Google reviews */
  async generateGoogleReviews() {
    const pending = await this.reviewModel.find({ status: 'pending' });
    const results: { id: string; generated_review: string; status: string }[] = [];

    for (const record of pending) {
      try {
        const reply = await this.generateGoogleReply(record);
        record.generated_review = reply;
        record.status           = 'generated';
        await record.save();

        results.push({ id: String(record._id), generated_review: reply, status: 'generated' });
      } catch (err) {
        this.logger.error(`Google: error generating reply for ${record._id}`, err as Error);
      }
    }

    return { source: 'google', processed: results.length, results };
  }

  /** Re-generate reply for ONE Google review by id */
  async generateSingleGoogleReply(id: string) {
    const record = await this.reviewModel.findById(id);
    if (!record) throw new NotFoundException(`Google review ${id} not found`);

    const reply             = await this.generateGoogleReply(record);
    record.generated_review = reply;
    record.status           = 'generated';
    await record.save();

    return { source: 'google', id: String(record._id), generated_review: reply, status: 'generated' };
  }

  // ═══════════════════════════════════════════════════════════════════════
  //  AGENT 1-B  ·  META — reply generator
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Build a prompt for a single Meta comment.
   * We don't have a numeric rating for Meta, so we use a neutral tone by default.
   */
  private buildMetaReplyPrompt(authorName: string, commentText: string): string {
    return `
You are a social-media community manager writing SHORT replies to Facebook comments.

Commenter Name: ${authorName}
Comment: ${commentText}

STRICT RULES:
- Start with "Hi ,"
- Then ONE sentence only. Maximum 15 words after the greeting.
- Start the sentence with "Thank you" for positive/neutral comments.
- Start the sentence with "We're sorry" for complaints or negative comments.
- Reference ONE specific detail from the comment if possible.
- NO long paragraphs. NO multiple sentences. NO sign-offs.

Return only the single short reply, nothing else.
`;
  }

  private async callOpenAIForMetaReply(prompt: string): Promise<string> {
    const response = await this.openai.chat.completions.create({
      model:       'gpt-4o-mini',
      messages:    [{ role: 'user', content: prompt }],
      max_tokens:  60,
      temperature: 0.3,
    });
    return response.choices[0].message?.content?.trim() ?? '';
  }

  /**
   * Process ALL Meta posts:
   * – For every comment whose commentId is NOT yet in `ai-generated`, generate a reply.
   * – Save replies in the `ai-generated` map:  { [commentId]: { reply, generatedAt } }
   */
  async generateMetaReplies() {
    const posts = await this.metaModel.find({});
    const results: {
      postId: string;
      commentId: string;
      reply: string;
    }[] = [];

    for (const post of posts) {
      // Initialise the map if missing
      const aiGenerated: Record<string, { reply: string; generatedAt: Date }> =
        (post['ai-generated'] as any) ?? {};

      let updated = false;

      for (const comment of post.comments ?? []) {
        // Skip if reply already exists for this commentId
        if (aiGenerated[comment.commentId]) continue;

        const text = comment.text?.trim();
        if (!text) continue; // skip empty comments

        try {
          const prompt = this.buildMetaReplyPrompt(comment.authorName, text);
          const reply  = await this.callOpenAIForMetaReply(prompt);

          aiGenerated[comment.commentId] = { reply, generatedAt: new Date() };
          updated = true;

          results.push({ postId: post.postId, commentId: comment.commentId, reply });
        } catch (err) {
          this.logger.error(
            `Meta: error generating reply for comment ${comment.commentId} in post ${post.postId}`,
            err as Error,
          );
        }
      }

      if (updated) {
        // Mongoose won't detect nested object mutations — use markModified
        post['ai-generated'] = aiGenerated;
        post.markModified('ai-generated');
        await post.save();
      }
    }

    return { source: 'meta', processed: results.length, results };
  }

  /**
   * Re-generate reply for ONE specific Meta comment.
   * @param postId    – the post's postId field (NOT _id)
   * @param commentId – the comment's commentId field
   */
  async generateSingleMetaReply(postId: string, commentId: string) {
    const post = await this.metaModel.findOne({ postId });
    if (!post) throw new NotFoundException(`Meta post ${postId} not found`);

    const comment = (post.comments ?? []).find((c) => c.commentId === commentId);
    if (!comment) throw new NotFoundException(`Comment ${commentId} not found in post ${postId}`);

    const prompt = this.buildMetaReplyPrompt(comment.authorName, comment.text ?? '');
    const reply  = await this.callOpenAIForMetaReply(prompt);

    const aiGenerated: Record<string, { reply: string; generatedAt: Date }> =
      (post['ai-generated'] as any) ?? {};

    aiGenerated[commentId] = { reply, generatedAt: new Date() };
    post['ai-generated']   = aiGenerated;
    post.markModified('ai-generated');
    await post.save();

    return { source: 'meta', postId, commentId, reply };
  }

  // ═══════════════════════════════════════════════════════════════════════
  //  AGENT 1  ·  UNIFIED ENTRY POINT
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Generate replies for the requested source(s).
   * @param source  'google' | 'meta' | 'all'  (default: 'all')
   */
  async generateReviews(source: ReviewSource = 'all') {
    const google = source === 'google' || source === 'all'
      ? await this.generateGoogleReviews()
      : null;

    const meta = source === 'meta' || source === 'all'
      ? await this.generateMetaReplies()
      : null;

    return { google, meta };
  }

  // ═══════════════════════════════════════════════════════════════════════
  //  AGENT 2  ·  ANALYSIS & RECOMMENDATIONS  (Google only — unchanged)
  // ═══════════════════════════════════════════════════════════════════════

  private async analyzeComment(comment: string): Promise<AnalysisResult> {
    const prompt = `
You are a business review analyst. Multiple customer reviews are given below, separated by "---".

Analyze ALL reviews TOGETHER and provide ONE combined output:

1. Overall Sentiment (one word: Positive / Negative / Mixed)
2. All Common Issues found across reviews (deduplicated list)
3. Exactly 5 actionable recommendations based on all the issues combined

Return ONLY JSON in this format:
{
  "sentiment": "",
  "issues": [],
  "recommendations": []
}

Reviews:
${comment}
`;

    const response = await this.openai.chat.completions.create({
      model:           'gpt-4o-mini',
      messages:        [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    });

    try {
      const raw    = response.choices[0].message?.content ?? '{}';
      const parsed = JSON.parse(raw);
      return {
        sentiment:       parsed.sentiment       ?? 'Unknown',
        issues:          parsed.issues          ?? [],
        recommendations: parsed.recommendations ?? [],
      };
    } catch (err) {
      this.logger.error('LLM JSON parse error', err as Error);
      return { sentiment: 'Unknown', issues: [], recommendations: [] };
    }
  }

  async analyzeComments() {
    const now          = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const comments = await this.reviewModel.find({
      rating:    { $lte: 3 },
      createdAt: { $gte: startOfMonth },
    });

    if (comments.length === 0) {
      return {
        processed_records: 0,
        already_analyzed: false,
        message: 'No low-rated reviews found for this month.',
      };
    }

    const existingRec = await this.recommendationModel.findOne({
      month: { $gte: startOfMonth },
    });

    if (existingRec) {
      const alreadyAnalyzedIds = (existingRec.reviewIds ?? []).map(String);
      const newReviewIds       = comments
        .map((c) => String(c._id))
        .filter((id) => !alreadyAnalyzedIds.includes(id));

      if (newReviewIds.length === 0) {
        return {
          processed_records: 0,
          already_analyzed: true,
          message: `All ${comments.length} reviews for this month are already analyzed.`,
        };
      }

      this.logger.log(`Found ${newReviewIds.length} new review(s) — re-analyzing...`);
    }

    const validComments = comments.filter((doc) => !!doc.comment);
    if (validComments.length === 0) {
      return { processed_records: 0, already_analyzed: false, message: 'No comments to analyze.' };
    }

    const combinedText = validComments
      .map((doc, i) => `Review ${i + 1} (Rating: ${doc.rating}/5):\n${doc.comment}`)
      .join('\n\n---\n\n');

    const analysis  = await this.analyzeComment(combinedText);
    const reviewIds = comments.map((doc) => doc._id);

    if (existingRec) {
      existingRec.reviewIds        = reviewIds;
      existingRec.sentiment        = analysis.sentiment;
      existingRec.issues           = analysis.issues;
      existingRec.recommendations  = analysis.recommendations;
      await existingRec.save();
    } else {
      await this.recommendationModel.create({
        reviewIds,
        brandId:         comments[0]?.brandId ?? 'unknown',
        userId:          comments[0]?.userId  ?? 'unknown',
        sentiment:       analysis.sentiment,
        issues:          analysis.issues,
        recommendations: analysis.recommendations,
        month:           startOfMonth,
      });
    }

    return {
      processed_records: comments.length,
      already_analyzed:  false,
      message: `Successfully analyzed ${comments.length} review(s) for this month.`,
    };
  }

  async getAllRecommendations(brandId?: string, userId?: string) {
    const filter: Record<string, any> = {};
    if (brandId) filter.brandId = brandId;
    if (userId)  filter.userId  = userId;

    const records = await this.recommendationModel.find(filter).sort({ createdAt: -1 });

    return {
      total: records.length,
      recommendations: records.map((r: any) => ({
        id:              String(r._id),
        reviewIds:       r.reviewIds?.map(String) ?? [],
        brandId:         r.brandId,
        userId:          r.userId,
        sentiment:       r.sentiment,
        issues:          r.issues,
        recommendations: r.recommendations,
        createdAt:       r.createdAt,
      })),
    };
  }

  // ═══════════════════════════════════════════════════════════════════════
  //  RUN ALL
  // ═══════════════════════════════════════════════════════════════════════

  async runAll() {
    const generation = await this.generateReviews('all');
    const analysis   = await this.analyzeComments();
    return { generation, analysis };
  }
}