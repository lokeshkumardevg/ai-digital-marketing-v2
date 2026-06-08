export const DEMO_DASHBOARD = {
  totalReviews: 1248,
  averageRating: 4.6,
  positiveSentiment: 82,
  negativeSentiment: 8,
  responseRate: 91,
  reviewGrowth: 24,
  byPlatform: {
    google: 650,
    facebook: 320,
    trustpilot: 180,
    website: 98,
  },
  ratingDistribution: {
    1: 15,
    2: 30,
    3: 80,
    4: 320,
    5: 803,
  },
  trend: [
    { _id: '2026-06-01', count: 35, avgRating: 4.5 },
    { _id: '2026-06-02', count: 42, avgRating: 4.7 },
    { _id: '2026-06-03', count: 39, avgRating: 4.6 },
    { _id: '2026-06-04', count: 48, avgRating: 4.8 },
    { _id: '2026-06-05', count: 44, avgRating: 4.5 },
    { _id: '2026-06-06', count: 51, avgRating: 4.7 },
    { _id: '2026-06-07', count: 47, avgRating: 4.8 },
  ],
};

export const DEMO_REVIEWS = [
  {
    _id: 'demo-review-1',
    reviewerName: 'John Smith',
    reviewerAvatar:
      'https://api.dicebear.com/7.x/initials/svg?seed=John+Smith',
    rating: 5,
    sentiment: 'positive',
    platform: 'google',
    content:
      'Amazing service and excellent product quality. Delivery was fast and customer support was very responsive.',
    topics: ['product', 'delivery', 'support'],
    status: 'replied',
    isReplied: true,
    reviewDate: new Date('2026-06-06'),
  },
  {
    _id: 'demo-review-2',
    reviewerName: 'Sarah Johnson',
    reviewerAvatar:
      'https://api.dicebear.com/7.x/initials/svg?seed=Sarah+Johnson',
    rating: 4,
    sentiment: 'positive',
    platform: 'facebook',
    content:
      'Very happy with my purchase. Packaging was nice and product matched expectations.',
    topics: ['packaging', 'product'],
    status: 'pending',
    isReplied: false,
    reviewDate: new Date('2026-06-05'),
  },
  {
    _id: 'demo-review-3',
    reviewerName: 'Michael Brown',
    reviewerAvatar:
      'https://api.dicebear.com/7.x/initials/svg?seed=Michael+Brown',
    rating: 2,
    sentiment: 'negative',
    platform: 'trustpilot',
    content:
      'Delivery was delayed by almost two weeks. Product quality is good but shipping needs improvement.',
    topics: ['shipping', 'delivery'],
    status: 'pending',
    isReplied: false,
    reviewDate: new Date('2026-06-04'),
  },
  {
    _id: 'demo-review-4',
    reviewerName: 'Emily Davis',
    reviewerAvatar:
      'https://api.dicebear.com/7.x/initials/svg?seed=Emily+Davis',
    rating: 5,
    sentiment: 'positive',
    platform: 'google',
    content:
      'Absolutely love this brand. Quality is consistently excellent.',
    topics: ['quality', 'brand'],
    status: 'replied',
    isReplied: true,
    reviewDate: new Date('2026-06-03'),
  },
  {
    _id: 'demo-review-5',
    reviewerName: 'David Wilson',
    reviewerAvatar:
      'https://api.dicebear.com/7.x/initials/svg?seed=David+Wilson',
    rating: 3,
    sentiment: 'neutral',
    platform: 'website',
    content:
      'Product is okay. Customer support was helpful but pricing feels slightly high.',
    topics: ['pricing', 'support'],
    status: 'pending',
    isReplied: false,
    reviewDate: new Date('2026-06-02'),
  },
];

export const DEMO_CUSTOMERS = [
  {
    _id: 'demo-customer-1',
    name: 'Michael Brown',
    email: 'michael@example.com',
    phone: '+1 555-123-4567',
    source: 'website',
    reviewRequested: true,
    reviewRequestedAt: new Date(),
    totalOrders: 8,
    totalSpent: 1240,
    createdAt: new Date(),
  },
  {
    _id: 'demo-customer-2',
    name: 'Emma Wilson',
    email: 'emma@example.com',
    phone: '+1 555-987-6543',
    source: 'shopify',
    reviewRequested: false,
    totalOrders: 4,
    totalSpent: 620,
    createdAt: new Date(),
  },
  {
    _id: 'demo-customer-3',
    name: 'James Anderson',
    email: 'james@example.com',
    phone: '+1 555-456-7890',
    source: 'csv',
    reviewRequested: true,
    totalOrders: 12,
    totalSpent: 2380,
    createdAt: new Date(),
  },
];

export const DEMO_RATING_TREND = [
  {
    month: '2026-01',
    avgRating: 4.2,
    count: 120,
  },
  {
    month: '2026-02',
    avgRating: 4.3,
    count: 145,
  },
  {
    month: '2026-03',
    avgRating: 4.5,
    count: 170,
  },
  {
    month: '2026-04',
    avgRating: 4.6,
    count: 190,
  },
  {
    month: '2026-05',
    avgRating: 4.7,
    count: 220,
  },
  {
    month: '2026-06',
    avgRating: 4.8,
    count: 260,
  },
];

export const DEMO_SENTIMENT_TREND = [
  {
    month: '2026-01',
    positive: 70,
    neutral: 20,
    negative: 10,
  },
  {
    month: '2026-02',
    positive: 74,
    neutral: 18,
    negative: 8,
  },
  {
    month: '2026-03',
    positive: 78,
    neutral: 15,
    negative: 7,
  },
  {
    month: '2026-04',
    positive: 80,
    neutral: 13,
    negative: 7,
  },
  {
    month: '2026-05',
    positive: 82,
    neutral: 11,
    negative: 7,
  },
  {
    month: '2026-06',
    positive: 84,
    neutral: 10,
    negative: 6,
  },
];

export const DEMO_TOPIC_BREAKDOWN = [
  {
    _id: 'product quality',
    total: 210,
    positive: 180,
    negative: 30,
  },
  {
    _id: 'shipping',
    total: 170,
    positive: 110,
    negative: 60,
  },
  {
    _id: 'customer service',
    total: 140,
    positive: 120,
    negative: 20,
  },
  {
    _id: 'pricing',
    total: 90,
    positive: 50,
    negative: 40,
  },
  {
    _id: 'packaging',
    total: 80,
    positive: 70,
    negative: 10,
  },
];

export const DEMO_INSIGHTS = [
  {
    _id: 'demo-insight-1',
    type: 'insight',
    priority: 'high',
    title: 'Improve Shipping Experience',
    content:
      'Shipping delays are the most common source of negative reviews. Consider introducing expedited delivery options and proactive tracking updates.',
    read: false,
    generatedAt: new Date(),
  },
  {
    _id: 'demo-insight-2',
    type: 'campaign_idea',
    priority: 'medium',
    title: 'Promote Customer Success Stories',
    content:
      'Convert top-rated customer reviews into social media posts and testimonial campaigns to improve trust and conversions.',
    read: false,
    generatedAt: new Date(),
  },
  {
    _id: 'demo-insight-3',
    type: 'social_post',
    priority: 'medium',
    title: 'Highlight Product Quality',
    content:
      'Many positive reviews mention quality. Create a campaign showcasing craftsmanship, materials, and customer feedback.',
    read: false,
    generatedAt: new Date(),
  },
  {
    _id: 'demo-insight-4',
    type: 'email_copy',
    priority: 'low',
    title: 'Review Request Campaign',
    content:
      'Send post-purchase emails 7 days after delivery asking customers to leave a review and share their experience.',
    read: false,
    generatedAt: new Date(),
  },
];