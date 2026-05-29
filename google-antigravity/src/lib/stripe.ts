import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // Use the SDK's pinned default API version to keep types in sync.
  apiVersion: '2026-04-22.dahlia',
})
