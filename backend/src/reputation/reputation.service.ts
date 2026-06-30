import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import OpenAI from 'openai';
import { Review } from './schemas/review.schema';
import { Customer } from './schemas/customer.schema';
import { Insight } from './schemas/insight.schema';
import {
  DEMO_DASHBOARD,
  DEMO_REVIEWS,
  DEMO_CUSTOMERS,
  DEMO_RATING_TREND,
  DEMO_SENTIMENT_TREND,
  DEMO_TOPIC_BREAKDOWN,
  DEMO_INSIGHTS,
} from './demo-data';
import { CreateLeadDto } from 'src/dto/create-lead.dto';

@Injectable()
export class ReputationService {
  private readonly logger = new Logger(ReputationService.name);
  private openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  constructor(
    @InjectModel('Review')   private reviewModel:   Model<any>,
    @InjectModel('Customer') private customerModel: Model<any>,
    @InjectModel('Insight')  private insightModel:  Model<any>,
    @InjectModel('PostReviewMeta') private postMetaModel: Model<any>, 
  ) {}

  // ═══════════════════════════════════════════════════════════
  // DASHBOARD
  // ═══════════════════════════════════════════════════════════

  // GET /reputation/dashboard/stats?brandId=xxx
async getDashboardStats(brandId: string) {
  const filter: any = brandId ? { brandId } : {};

  const [
    totalReviews,
    avgRatingAgg,
    sentimentCounts,
    platformCounts,
    ratingDistribution,
    repliedCount,
    recentTrend,
    fbStats, // naya — facebook comments stats
  ] = await Promise.all([
    this.reviewModel.countDocuments(filter),
    this.reviewModel.aggregate([
      { $match: filter },
      { $group: { _id: null, avg: { $avg: '$rating' } } },
    ]),
    // ---- UPDATED: sentiment ab stored '$sentiment' field se nahi, balki
    // rating se directly derive ho rha h -> rating <= 3 = negative, rating > 3 = positive
    this.reviewModel.aggregate([
      { $match: filter },
      {
        $group: {
          _id: {
            $cond: [
              { $lte: ['$rating', 3] }, // rating 1, 2, 3 -> negative
              'negative',
              'positive',               // rating 4, 5 -> positive
            ],
          },
          count: { $sum: 1 },
        },
      },
    ]),
    this.reviewModel.aggregate([
      { $match: filter },
      { $group: { _id: '$platform', count: { $sum: 1 } } },
    ]),
    this.reviewModel.aggregate([
      { $match: filter },
      { $group: { _id: '$rating', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    this.reviewModel.countDocuments({ ...filter, isReplied: true }),
    // ---- FIXED: reviewDate may be stored as a string, $convert before $dateToString ----
    this.reviewModel.aggregate([
      { $match: filter },
      {
        $addFields: {
          _reviewDate: {
            $convert: { input: '$reviewDate', to: 'date', onError: null, onNull: null },
          },
        },
      },
      { $match: { _reviewDate: { $ne: null } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$_reviewDate' } },
          count: { $sum: 1 },
          avgRating: { $avg: '$rating' },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 30 },
    ]),
    this.getFacebookCommentStats(brandId), // naya
  ]);

  const avg = avgRatingAgg[0]?.avg ?? 0;

  const sentimentMap: any = {};
  sentimentCounts.forEach((s: any) => { sentimentMap[s._id] = s.count; });

  const platformMap: any = {};
  platformCounts.forEach((p: any) => { platformMap[p._id] = p.count; });
  // Facebook ka actual count comments se add karo
  platformMap['facebook'] = (platformMap['facebook'] || 0) + fbStats.totalComments;

  const ratingMap: any = {};
  ratingDistribution.forEach((r: any) => { ratingMap[r._id] = r.count; });

  const positiveCount = sentimentMap['positive'] || 0;
  const negativeCount = sentimentMap['negative'] || 0;

  // Combined totals: Google reviews + Facebook comments
  const combinedTotal = totalReviews + fbStats.totalComments;
  const combinedReplied = repliedCount + fbStats.repliedComments;

  // Rating/sentiment sirf un items pe based h jinke paas actually ye data h (abhi sirf Google)
  const ratedReviewsCount = totalReviews;

  const responseRate =
    combinedTotal > 0 ? Math.round((combinedReplied / combinedTotal) * 100) : 0;

  // Trend ko date-wise merge karo (Google reviewDate + FB comment createdAt)
  const trendMap: Record<string, { count: number; ratingSum: number; ratingCount: number }> = {};

  recentTrend.forEach((t: any) => {
    trendMap[t._id] = {
      count: t.count,
      ratingSum: (t.avgRating || 0) * t.count,
      ratingCount: t.count,
    };
  });

  fbStats.trend.forEach((t: any) => {
    if (!trendMap[t._id]) trendMap[t._id] = { count: 0, ratingSum: 0, ratingCount: 0 };
    trendMap[t._id].count += t.count;
  });

  const trend = Object.keys(trendMap)
    .sort()
    .map((date) => ({
      _id: date,
      count: trendMap[date].count,
      avgRating:
        trendMap[date].ratingCount > 0
          ? Math.round((trendMap[date].ratingSum / trendMap[date].ratingCount) * 10) / 10
          : null, // us din rating available nahi (sirf FB comments hue)
    }));

  return {
    totalReviews: combinedTotal,              // Google + Facebook combined
    googleReviewsCount: totalReviews,         // breakdown ke liye
    facebookCommentsCount: fbStats.totalComments,
    averageRating: Math.round(avg * 10) / 10, // sirf Google pe based (FB me rating nahi hoti)
    ratedReviewsCount,                        // frontend ko bata dega ye avg kis count pe h
    positiveSentiment:
      ratedReviewsCount > 0 ? Math.round((positiveCount / ratedReviewsCount) * 100) : 0,
    negativeSentiment:
      ratedReviewsCount > 0 ? Math.round((negativeCount / ratedReviewsCount) * 100) : 0,
    responseRate,                             // Google + FB combined replied %
    reviewGrowth: 24,
    byPlatform: platformMap,
    ratingDistribution: ratingMap,
    trend,
    isDemoData: false,
  };
}

private async getFacebookCommentStats(brandId: string) {
  // CONFIRMED: postMeta docs have a direct brandId field (verified from sample doc),
  // so match on it directly — do NOT match on pageId, brandId !== pageId.
  const matchFilter: any = brandId ? { brandId } : {};

  const [totals] = await this.postMetaModel.aggregate([
    { $match: matchFilter },
    { $unwind: { path: '$comments', preserveNullAndEmptyArrays: false } },
    {
      $group: {
        _id: null,
        totalComments: { $sum: 1 },
        repliedComments: {
          $sum: {
            $cond: [
              { $gt: [{ $size: { $ifNull: ['$comments.replies', []] } }, 0] },
              1,
              0,
            ],
          },
        },
      },
    },
  ]);

  // ---- FIXED: comments.createdAt may be stored as a string, $convert before $dateToString ----
  const trend = await this.postMetaModel.aggregate([
    { $match: matchFilter },
    { $unwind: '$comments' },
    {
      $addFields: {
        _commentDate: {
          $convert: {
            input: '$comments.createdAt',
            to: 'date',
            onError: null, // unparseable string -> null instead of throwing
            onNull: null,
          },
        },
      },
    },
    { $match: { _commentDate: { $ne: null } } }, // drop comments with no valid date
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$_commentDate' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    { $limit: 30 },
  ]);

  return {
    totalComments: totals?.totalComments || 0,
    repliedComments: totals?.repliedComments || 0,
    trend,
  };
}

  // ═══════════════════════════════════════════════════════════
  // REVIEWS INBOX
  // ═══════════════════════════════════════════════════════════

  // GET /reputation/reviews?brandId=xxx&platform=google&page=1&limit=20
  async getReviews(query: {
    brandId?: string;
    platform?: string;
    sentiment?: string;
    status?: string;
    rating?: number;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const {
      brandId, platform, sentiment, status,
      rating, search, page = 1, limit = 20,
    } = query;

    const filter: any = {};
    if (brandId)                      filter.brandId   = brandId;
    if (platform && platform !== 'all') filter.platform  = platform;
    if (sentiment && sentiment !== 'all') filter.sentiment = sentiment;
    if (status && status !== 'all')   filter.status    = status;
    if (rating)                       filter.rating    = Number(rating);
    if (search)                       filter.content   = { $regex: search, $options: 'i' };

    const skip = (page - 1) * limit;
    const [reviews, total] = await Promise.all([
      this.reviewModel.find(filter).sort({ reviewDate: -1 }).skip(skip).limit(limit).lean(),
      this.reviewModel.countDocuments(filter),
    ]);

    return { reviews, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  // GET /reputation/reviews/:id
async getReviewById(id: string) {
  const review = await this.reviewModel.findById(id).lean();

  return {
    ...review,
    isDemoData: false,
  };
}

  // POST /reputation/reviews/seed?brandId=xxx
  async seedMockReviews(brandId: string) {
    const existing = await this.reviewModel.countDocuments({ brandId });
    if (existing > 0) return { seeded: false, message: 'Already has reviews' };

    const mockReviews = [
      { reviewerName: 'John D.',     rating: 5, sentiment: 'positive', platform: 'google',     content: 'Amazing product quality! The shipping was fast and the customer service was outstanding. Will definitely order again.',                      topics: ['product', 'shipping', 'customer service'], status: 'replied',  isReplied: true  },
      { reviewerName: 'Sarah M.',    rating: 4, sentiment: 'positive', platform: 'facebook',   content: 'Great service overall. The product exceeded my expectations. Just wish the packaging was a bit more eco-friendly.',                          topics: ['product', 'packaging'],                    status: 'pending',  isReplied: false },
      { reviewerName: 'Michael T.',  rating: 2, sentiment: 'negative', platform: 'trustpilot', content: 'Delivery took too long. I waited 3 weeks for my order. The product itself is fine but the wait was unacceptable.',                          topics: ['delivery', 'shipping'],                    status: 'pending',  isReplied: false },
      { reviewerName: 'Emily R.',    rating: 5, sentiment: 'positive', platform: 'google',     content: 'Absolutely love this brand! Their summer collection is incredible. Top-notch quality and the fit is perfect.',                               topics: ['product', 'quality'],                      status: 'replied',  isReplied: true  },
      { reviewerName: 'David K.',    rating: 3, sentiment: 'neutral',  platform: 'website',    content: 'Product is decent but the price seems a bit high compared to competitors. Customer support was helpful though.',                             topics: ['pricing', 'customer service'],             status: 'pending',  isReplied: false },
      { reviewerName: 'Lisa P.',     rating: 1, sentiment: 'negative', platform: 'google',     content: 'Very disappointed. The product looks nothing like the photos. I tried to return it and the process was a nightmare.',                        topics: ['product', 'returns', 'customer service'],  status: 'pending',  isReplied: false },
      { reviewerName: 'James W.',    rating: 5, sentiment: 'positive', platform: 'trustpilot', content: 'Excellent! I have been a loyal customer for 3 years and they never disappoint. Quality is always consistent.',                              topics: ['product', 'loyalty'],                      status: 'replied',  isReplied: true  },
      { reviewerName: 'Anna S.',     rating: 4, sentiment: 'positive', platform: 'facebook',   content: 'Really happy with my purchase! The color options are beautiful and the material feels premium. Fast delivery too!',                          topics: ['product', 'delivery'],                     status: 'pending',  isReplied: false },
      { reviewerName: 'Robert B.',   rating: 2, sentiment: 'negative', platform: 'website',    content: 'Had issues with sizing. The size guide is not accurate at all. Had to exchange twice before getting the right fit.',                         topics: ['sizing', 'returns'],                       status: 'pending',  isReplied: false },
      { reviewerName: 'Jennifer L.', rating: 5, sentiment: 'positive', platform: 'google',     content: 'Ordered for a birthday gift and wow - the packaging alone is gorgeous! Person loved it. Will be back for sure!',                            topics: ['packaging', 'gifting'],                    status: 'pending',  isReplied: false },
    ];

    const now = new Date();
    const docs = mockReviews.map((r, i) => ({
      ...r,
      brandId,
      reviewerAvatar: `https://api.dicebear.com/7.x/initials/svg?seed=${r.reviewerName}`,
      reviewDate: new Date(now.getTime() - i * 2 * 24 * 60 * 60 * 1000),
    }));

    await this.reviewModel.insertMany(docs);
    return { seeded: true, count: docs.length };
  }

  // POST /reputation/reviews/:id/generate-reply
  async generateAiReply(reviewId: string) {
    const review = await this.reviewModel.findById(reviewId).lean();
    if (!review) throw new NotFoundException('Review not found');

    const prompt = `
You are a professional brand reputation manager. Generate a concise, empathetic, and professional reply to the following customer review.

Review from ${review.reviewerName} (${review.rating} stars on ${review.platform}):
"${review.content}"

Sentiment: ${review.sentiment}
Topics mentioned: ${(review.topics || []).join(', ')}

Rules:
- Keep reply under 100 words
- Be genuine and empathetic
- If negative, acknowledge the issue and offer a solution
- If positive, express gratitude and reinforce the brand
- Don't use generic phrases like "We value your feedback"
- End with a forward-looking statement

Reply only the message text, no quotes.
    `.trim();

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.7,
      max_tokens: 200,
      messages: [{ role: 'user', content: prompt }],
    });

    const generatedReply = completion.choices[0].message.content?.trim() || '';
    await this.reviewModel.findByIdAndUpdate(reviewId, { generatedReply });
    return { reviewId, generatedReply };
  }

  // POST /reputation/reviews/:id/publish-reply
  async publishReply(reviewId: string, replyText: string) {
    await this.reviewModel.findByIdAndUpdate(reviewId, {
      publishedReply: replyText,
      generatedReply: replyText,
      isReplied: true,
      status: 'replied',
    });
    return { success: true, reviewId };
  }

  // PATCH /reputation/reviews/:id/resolve
  async markResolved(reviewId: string) {
    await this.reviewModel.findByIdAndUpdate(reviewId, {
      isResolved: true,
      status: 'ignored',
    });
    return { success: true, reviewId };
  }

  // POST /reputation/reviews/:id/analyze-sentiment
  async analyzeSentiment(reviewId: string) {
    const review = await this.reviewModel.findById(reviewId).lean();
    if (!review) throw new NotFoundException('Review not found');

    const prompt = `
Analyze this review and return ONLY a JSON object with this exact shape:
{"sentiment":"positive|negative|neutral|mixed","topics":["topic1","topic2"],"priority":"high|medium|low","summary":"one sentence"}

Review: "${review.content}"
    `.trim();

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.1,
      max_tokens: 150,
      response_format: { type: 'json_object' },
      messages: [{ role: 'user', content: prompt }],
    });

    const analysis = JSON.parse(completion.choices[0].message.content || '{}');
    await this.reviewModel.findByIdAndUpdate(reviewId, {
      sentiment: analysis.sentiment,
      topics: analysis.topics,
    });
    return { reviewId, analysis };
  }

  // ═══════════════════════════════════════════════════════════
  // CUSTOMERS
  // ═══════════════════════════════════════════════════════════

  // GET /reputation/customers?brandId=xxx&page=1&limit=20
  async getCustomers(brandId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.customerModel.find({ brandId }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      this.customerModel.countDocuments({ brandId }),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  // POST /reputation/customers
  async createCustomer(brandId: string, dto: Partial<Customer>) {
    return this.customerModel.create({ ...dto, brandId });
  }

  // POST /reputation/customers/import
  async importCustomers(brandId: string, customers: Partial<Customer>[]) {
    const docs = customers.map((c) => ({ ...c, brandId, source: c.source || 'csv' }));
    return this.customerModel.insertMany(docs, { ordered: false });
  }

  // GET /reputation/customers/:id
async getCustomerById(id: string, brandId: string) {
  const customer = await this.customerModel
    .findOne({ _id: id, brandId })
    .lean();

  return {
    ...customer,
    isDemoData: false,
  };
}

  // PATCH /reputation/customers/:id
  async updateCustomer(id: string, brandId: string, dto: Partial<Customer>) {
    return this.customerModel.findOneAndUpdate({ _id: id, brandId }, dto, { new: true });
  }

  // DELETE /reputation/customers/:id
  async deleteCustomer(id: string, brandId: string) {
    await this.customerModel.findOneAndDelete({ _id: id, brandId });
    return { success: true, id };
  }

  // POST /reputation/customers/:id/send-request
  async sendReviewRequest(customerId: string, brandId: string) {
    const customer = await this.customerModel.findOne({ _id: customerId, brandId });
    if (!customer) throw new NotFoundException('Customer not found');

    await this.customerModel.findByIdAndUpdate(customerId, {
      reviewRequested: true,
      reviewRequestedAt: new Date(),
    });

    // TODO: integrate email/SMS provider here (e.g. SendGrid, Twilio)
    this.logger.log(`Review request sent to ${customer.email}`);
    return { success: true, customerId, email: customer.email };
  }

  // ═══════════════════════════════════════════════════════════
  // ANALYTICS
  // ═══════════════════════════════════════════════════════════

  // GET /reputation/analytics/rating-trend?brandId=xxx&months=6
async getRatingTrend(brandId: string, months = 6) {
  const googleFilter: any = brandId ? { brandId } : {};
  const fbFilter: any     = brandId ? { brandId } : {};
 
  // ── 1. Google reviews — monthly ─────────────────────────
  const [googleMonthly, googleTotals] = await Promise.all([
    this.reviewModel.aggregate([
      { $match: googleFilter },
      {
        $addFields: {
          _d: { $convert: { input: '$reviewDate', to: 'date', onError: null, onNull: null } },
        },
      },
      { $match: { _d: { $ne: null } } },
      {
        $group: {
          _id:       { year: { $year: '$_d' }, month: { $month: '$_d' } },
          avgRating: { $avg: '$rating' },
          count:     { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: months },
    ]),
 
    // Google overall totals
    this.reviewModel.aggregate([
      { $match: googleFilter },
      {
        $group: {
          _id:       null,
          total:     { $sum: 1 },
          avgRating: { $avg: '$rating' },
        },
      },
    ]),
  ]);
 
  // ── 2. Facebook comments — monthly ──────────────────────
  const [fbMonthly, fbTotals] = await Promise.all([
    this.postMetaModel.aggregate([
      { $match: fbFilter },
      { $unwind: { path: '$comments', preserveNullAndEmptyArrays: false } },
      {
        $addFields: {
          _d: { $convert: { input: '$comments.createdAt', to: 'date', onError: null, onNull: null } },
        },
      },
      { $match: { _d: { $ne: null } } },
      {
        $group: {
          _id:   { year: { $year: '$_d' }, month: { $month: '$_d' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: months },
    ]),
 
    // FB overall totals
    this.postMetaModel.aggregate([
      { $match: fbFilter },
      { $unwind: { path: '$comments', preserveNullAndEmptyArrays: false } },
      { $group: { _id: null, total: { $sum: 1 } } },
    ]),
  ]);
 
  // ── 3. Merge Google + FB by month key ───────────────────
  const map: Record<string, {
    month: string; avgRating: number | null;
    googleCount: number; fbCount: number;
  }> = {};
 
  googleMonthly.forEach((t: any) => {
    const key = `${t._id.year}-${String(t._id.month).padStart(2, '0')}`;
    map[key] = {
      month:       key,
      avgRating:   Math.round((t.avgRating ?? 0) * 10) / 10,
      googleCount: t.count,
      fbCount:     0,
    };
  });
 
  fbMonthly.forEach((t: any) => {
    const key = `${t._id.year}-${String(t._id.month).padStart(2, '0')}`;
    if (!map[key]) map[key] = { month: key, avgRating: null, googleCount: 0, fbCount: 0 };
    map[key].fbCount = t.count;
  });
 
  const data = Object.values(map)
    .sort((a, b) => a.month.localeCompare(b.month))
    .map((m) => ({
      month:       m.month,
      avgRating:   m.avgRating,                   // null → FB-only month
      count:       m.googleCount + m.fbCount,     // combined
      googleCount: m.googleCount,
      fbCount:     m.fbCount,
    }));
 
  // ── 4. Overall totals ────────────────────────────────────
  const googleTotal     = googleTotals[0]?.total     ?? 0;
  const googleAvgRating = googleTotals[0]?.avgRating ?? 0;
  const fbTotal         = fbTotals[0]?.total         ?? 0;
 
  return {
    data,
    totals: {
      totalReviews:     googleTotal + fbTotal,
      googleReviews:    googleTotal,
      fbComments:       fbTotal,
      overallAvgRating: Math.round(googleAvgRating * 10) / 10,  // Google only
    },
    isDemoData: false,
  };
}

  // GET /reputation/analytics/sentiment-trend?brandId=xxx
async getSentimentTrend(brandId: string) {
  const googleFilter: any = brandId ? { brandId } : {};
  const fbFilter: any     = brandId ? { brandId } : {};
 
  // ── 1. Google reviews — sentiment derived from rating ───
  const [googleMonthly, googleSentimentTotals] = await Promise.all([
    this.reviewModel.aggregate([
      { $match: googleFilter },
      {
        $addFields: {
          _d: { $convert: { input: '$reviewDate', to: 'date', onError: null, onNull: null } },
          _sentiment: {
            $cond: [{ $lte: ['$rating', 3] }, 'negative', 'positive'],
          },
        },
      },
      { $match: { _d: { $ne: null } } },
      {
        $group: {
          _id: {
            year:      { $year:  '$_d' },
            month:     { $month: '$_d' },
            sentiment: '$_sentiment',
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),
 
    // Google overall positive/negative totals
    this.reviewModel.aggregate([
      { $match: googleFilter },
      {
        $addFields: {
          _sentiment: {
            $cond: [{ $lte: ['$rating', 3] }, 'negative', 'positive'],
          },
        },
      },
      {
        $group: {
          _id:   '$_sentiment',
          count: { $sum: 1 },
        },
      },
    ]),
  ]);
 
  // ── 2. Facebook comments — monthly (all neutral) ────────
  const [fbMonthly, fbTotal] = await Promise.all([
    this.postMetaModel.aggregate([
      { $match: fbFilter },
      { $unwind: { path: '$comments', preserveNullAndEmptyArrays: false } },
      {
        $addFields: {
          _d: { $convert: { input: '$comments.createdAt', to: 'date', onError: null, onNull: null } },
        },
      },
      { $match: { _d: { $ne: null } } },
      {
        $group: {
          _id:   { year: { $year: '$_d' }, month: { $month: '$_d' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),
 
    this.postMetaModel.aggregate([
      { $match: fbFilter },
      { $unwind: { path: '$comments', preserveNullAndEmptyArrays: false } },
      { $group: { _id: null, total: { $sum: 1 } } },
    ]),
  ]);
 
  // ── 3. Pivot Google monthly rows → { month, positive, negative } ─
  const map: Record<string, { month: string; positive: number; negative: number; neutral: number }> = {};
 
  googleMonthly.forEach((row: any) => {
    const key = `${row._id.year}-${String(row._id.month).padStart(2, '0')}`;
    if (!map[key]) map[key] = { month: key, positive: 0, negative: 0, neutral: 0 };
    if (row._id.sentiment === 'positive') map[key].positive += row.count;
    else                                  map[key].negative += row.count;
  });
 
  // Merge FB monthly → neutral bucket
  fbMonthly.forEach((row: any) => {
    const key = `${row._id.year}-${String(row._id.month).padStart(2, '0')}`;
    if (!map[key]) map[key] = { month: key, positive: 0, negative: 0, neutral: 0 };
    map[key].neutral += row.count;
  });
 
  const data = Object.values(map)
    .sort((a, b) => a.month.localeCompare(b.month))
    .map((m) => ({
      ...m,
      total: m.positive + m.negative + m.neutral,
    }));
 
  // ── 4. Overall sentiment totals ──────────────────────────
  const sentMap: Record<string, number> = {};
  googleSentimentTotals.forEach((s: any) => { sentMap[s._id] = s.count; });
 
  const totalPositive  = sentMap['positive'] ?? 0;
  const totalNegative  = sentMap['negative'] ?? 0;
  const totalNeutral   = fbTotal[0]?.total   ?? 0;
  const googleReviews  = totalPositive + totalNegative;
  const totalReviews   = googleReviews + totalNeutral;
 
  return {
    data,
    totals: {
      totalReviews,
      googleReviews,
      fbComments:   totalNeutral,
      totalPositive,
      totalNegative,
      totalNeutral,
      positivePct: googleReviews > 0 ? Math.round((totalPositive / googleReviews) * 100) : 0,
      negativePct: googleReviews > 0 ? Math.round((totalNegative / googleReviews) * 100) : 0,
    },
    isDemoData: false,
  };
}

  // GET /reputation/analytics/topic-breakdown?brandId=xxx
// GET /reputation/analytics/topic-breakdown?brandId=xxx
async getTopicBreakdown(brandId: string) {
  const googleFilter: any = brandId ? { brandId } : {};
  const fbFilter: any     = brandId ? { brandId } : {};
 
  // ── 1. Google — topic breakdown ──────────────────────────
  // Sentiment derived from rating (consistent with getDashboardStats)
  const [topicData, googleOverall, fbOverall] = await Promise.all([
    this.reviewModel.aggregate([
      { $match: googleFilter },
      { $unwind: '$topics' },
      {
        $addFields: {
          _sentiment: {
            $cond: [{ $lte: ['$rating', 3] }, 'negative', 'positive'],
          },
        },
      },
      {
        $group: {
          _id:      '$topics',
          total:    { $sum: 1 },
          positive: { $sum: { $cond: [{ $eq: ['$_sentiment', 'positive'] }, 1, 0] } },
          negative: { $sum: { $cond: [{ $eq: ['$_sentiment', 'negative'] }, 1, 0] } },
          // Avg rating per topic
          avgRating: { $avg: '$rating' },
          // Platforms where this topic appears
          platforms: { $addToSet: '$platform' },
        },
      },
      { $sort: { total: -1 } },
      { $limit: 10 },
    ]),
 
    // Google overall counts
    this.reviewModel.aggregate([
      { $match: googleFilter },
      {
        $addFields: {
          _sentiment: {
            $cond: [{ $lte: ['$rating', 3] }, 'negative', 'positive'],
          },
        },
      },
      {
        $group: {
          _id:      '$_sentiment',
          count:    { $sum: 1 },
        },
      },
    ]),
 
    // FB overall comment count
    this.postMetaModel.aggregate([
      { $match: fbFilter },
      { $unwind: { path: '$comments', preserveNullAndEmptyArrays: false } },
      { $group: { _id: null, total: { $sum: 1 } } },
    ]),
  ]);
 
  // ── 2. Enrich topic data with % ──────────────────────────
  const data = topicData.map((t: any) => ({
    _id:             t._id,
    total:           t.total,
    positive:        t.positive,
    negative:        t.negative,
    positivePercent: t.total > 0 ? Math.round((t.positive / t.total) * 100) : 0,
    negativePercent: t.total > 0 ? Math.round((t.negative / t.total) * 100) : 0,
    avgRating:       Math.round((t.avgRating ?? 0) * 10) / 10,
    platforms:       t.platforms ?? [],
  }));
 
  // ── 3. Overall totals ────────────────────────────────────
  const sentMap: Record<string, number> = {};
  googleOverall.forEach((s: any) => { sentMap[s._id] = s.count; });
 
  const totalPositive   = sentMap['positive'] ?? 0;
  const totalNegative   = sentMap['negative'] ?? 0;
  const googleReviews   = totalPositive + totalNegative;
  const fbComments      = fbOverall[0]?.total ?? 0;
  const totalTopicMentions = data.reduce((sum: number, t: any) => sum + t.total, 0);
 
  return {
    data,
    totals: {
      totalReviews:       googleReviews + fbComments,
      googleReviews,
      fbComments,
      totalPositive,
      totalNegative,
      totalTopicMentions,
      positivePct: googleReviews > 0 ? Math.round((totalPositive / googleReviews) * 100) : 0,
      negativePct: googleReviews > 0 ? Math.round((totalNegative / googleReviews) * 100) : 0,
    },
    isDemoData: false,
  };
}
 

  // ═══════════════════════════════════════════════════════════
  // RECOMMENDATIONS
  // ═══════════════════════════════════════════════════════════

  // GET /reputation/recommendations?brandId=xxx
async getInsights(brandId: string) {
  const insights = await this.insightModel
    .find({ brandId })
    .sort({ createdAt: -1 })
    .lean();

  return insights;
}

  // POST /reputation/recommendations/generate?brandId=xxx
  async generateInsights(brandId: string) {
    const recentReviews = await this.reviewModel
      .find({ brandId })
      .sort({ reviewDate: -1 })
      .limit(20)
      .lean();

    const reviewSummary = recentReviews
      .map((r: any) => `${r.rating}★ (${r.sentiment}) [${r.platform}]: ${(r.content || '').slice(0, 120)}`)
      .join('\n');

    const prompt = `
Based on these recent customer reviews, generate 4 actionable business recommendations.

Reviews:
${reviewSummary}

Return ONLY a JSON array with exactly this shape (no extra keys):
[
  {
    "type": "campaign_idea | social_post | email_copy | insight",
    "priority": "high | medium | low",
    "title": "Short title under 8 words",
    "content": "Detailed actionable recommendation in 2-3 sentences"
  }
]
    `.trim();

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.7,
      max_tokens: 800,
      response_format: { type: 'json_object' },
      messages: [{ role: 'user', content: prompt }],
    });

    let recommendations: any[] = [];
    try {
      const parsed = JSON.parse(completion.choices[0].message.content || '[]');
      recommendations = Array.isArray(parsed) ? parsed : parsed.recommendations || [];
    } catch {
      throw new Error('AI returned invalid JSON');
    }

    const saved = await Promise.all(
      recommendations.map((rec: any) =>
        this.insightModel.create({ ...rec, brandId, generatedAt: new Date() }),
      ),
    );

    return saved;
  }

  // PATCH /reputation/recommendations/:id/read
  async markInsightRead(id: string, brandId: string) {
    return this.insightModel.findOneAndUpdate(
      { _id: id, brandId },
      { read: true },
      { new: true },
    );
  }

  // POST /reputation/leads
async createLeadsBulk(dtos: CreateLeadDto[]) {
  const docs = dtos.map(dto => ({
    brandId:         dto.brandId  || 'default',
    userId:          dto.userId,
    name:            dto.name,
    email:           dto.email,
    phone:           dto.phone    || '',
  }));

  const customers = await this.customerModel.insertMany(docs, { ordered: false });
  // ordered: false → continues on duplicate/validation errors, doesn't stop the batch

  return {
    success:   true,
    inserted:  customers.length,
    customers, // full array back
  };
}
  
}