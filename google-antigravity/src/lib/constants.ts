export const PLAN_LIMITS = {
  trial: {
    chatbots: 1,
    messagesPerMonth: 50,
    sources: 1,
    analytics: false,
    conversations: false,
    customBranding: false,
  },
  starter: {
    chatbots: 1,
    messagesPerMonth: 500,
    sources: 5,
    analytics: true,
    conversations: true,
    customBranding: false,
  },
  pro: {
    chatbots: 5,
    messagesPerMonth: 5000,
    sources: -1,
    analytics: true,
    conversations: true,
    customBranding: true,
  },
  business: {
    chatbots: -1,
    messagesPerMonth: 50000,
    sources: -1,
    analytics: true,
    conversations: true,
    customBranding: true,
  },
} as const;

export type PlanType = keyof typeof PLAN_LIMITS;

export const PLAN_PRICES = {
  starter: { monthly: 29, annual: 278, priceId: process.env.STRIPE_PRICE_STARTER! },
  pro: { monthly: 79, annual: 758, priceId: process.env.STRIPE_PRICE_PRO! },
  business: { monthly: 199, annual: 1910, priceId: process.env.STRIPE_PRICE_BUSINESS! },
};
