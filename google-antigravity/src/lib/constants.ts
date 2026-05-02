export const PLAN_LIMITS = {
  free:     { chatbots: 1, messagesPerMonth: 50,    sources: 3,  branding: true  },
  starter:  { chatbots: 1, messagesPerMonth: 500,   sources: 5,  branding: true  },
  pro:      { chatbots: 5, messagesPerMonth: 5000,  sources: -1, branding: false },
  business: { chatbots: -1,messagesPerMonth: 50000, sources: -1, branding: false },
};

export const PRICING = {
  starter: { monthly: 29, annual: 278, id: 'price_starter' },
  pro: { monthly: 79, annual: 758, id: 'price_pro' },
  business: { monthly: 199, annual: 1910, id: 'price_business' },
};
