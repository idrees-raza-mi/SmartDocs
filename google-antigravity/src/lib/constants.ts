export const PLAN_LIMITS = {
  trial: {
    chatbots: 1,
    messagesPerMonth: 50,
    sources: 1,
    sitemapMaxUrls: 0,
    apiAccess: false,
    webhooks: false,
    analytics: false,
    conversations: false,
    customBranding: false,
    leadCapture: false,
    scheduledRecrawl: false,
    knowledgeGap: false,
    confidenceScoring: false,
    slackWebhook: false,
    dailyDigest: false,
    auditLog: false,
    customDomain: false,
    teamMembers: 1,
  },
  starter: {
    chatbots: 1,
    messagesPerMonth: 500,
    sources: 5,
    sitemapMaxUrls: 0,
    apiAccess: false,
    webhooks: false,
    analytics: true,
    conversations: true,
    customBranding: false,
    leadCapture: true,
    scheduledRecrawl: false,
    knowledgeGap: false,
    confidenceScoring: false,
    slackWebhook: false,
    dailyDigest: false,
    auditLog: false,
    customDomain: false,
    teamMembers: 1,
  },
  pro: {
    chatbots: 5,
    messagesPerMonth: 5000,
    sources: -1,
    sitemapMaxUrls: 200,
    apiAccess: false,
    webhooks: false,
    analytics: true,
    conversations: true,
    customBranding: true,
    leadCapture: true,
    scheduledRecrawl: true,
    knowledgeGap: true,
    confidenceScoring: true,
    slackWebhook: true,
    dailyDigest: true,
    auditLog: false,
    customDomain: false,
    teamMembers: 5,
  },
  business: {
    chatbots: -1,
    messagesPerMonth: 50000,
    sources: -1,
    sitemapMaxUrls: 2000,
    apiAccess: true,
    webhooks: true,
    analytics: true,
    conversations: true,
    customBranding: true,
    leadCapture: true,
    scheduledRecrawl: true,
    knowledgeGap: true,
    confidenceScoring: true,
    slackWebhook: true,
    dailyDigest: true,
    auditLog: true,
    customDomain: true,
    teamMembers: 25,
  },
} as const;

export type PlanType = keyof typeof PLAN_LIMITS;
export type PlanFeature = keyof typeof PLAN_LIMITS['trial'];

export const PLAN_ORDER: PlanType[] = ['trial', 'starter', 'pro', 'business'];

export function planRank(plan: PlanType): number {
  return PLAN_ORDER.indexOf(plan);
}

export function requiredPlanFor(feature: PlanFeature): PlanType {
  for (const p of PLAN_ORDER) {
    const v = PLAN_LIMITS[p][feature];
    if (v === true || (typeof v === 'number' && v !== 0 && v !== -1)) return p;
  }
  return 'business';
}

export const PLAN_PRICES = {
  starter: { monthly: 29, annual: 278, priceId: process.env.STRIPE_PRICE_STARTER! },
  pro: { monthly: 79, annual: 758, priceId: process.env.STRIPE_PRICE_PRO! },
  business: { monthly: 199, annual: 1910, priceId: process.env.STRIPE_PRICE_BUSINESS! },
};

export const CONSTANTS = {
  SOUND_URL: '/sounds/whoosh.mp3',
  LOGOTYPE_COLORS: {
    G: '#4285F4',
    o1: '#EA4335',
    o2: '#FBBC05',
    g: '#4285F4',
    l: '#34A853',
    e: '#EA4335',
  },
};
