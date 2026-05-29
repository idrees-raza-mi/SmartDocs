import { createHmac, timingSafeEqual } from 'crypto';

const LS_API_URL = 'https://api.lemonsqueezy.com/v1';

// Variant ID → internal plan name. Populated from env at runtime so prod and
// preview environments can each have their own LemonSqueezy variants.
export function planForVariant(variantId: string | number): 'starter' | 'pro' | 'business' | null {
  const v = String(variantId);
  if (v === process.env.LEMONSQUEEZY_VARIANT_STARTER) return 'starter';
  if (v === process.env.LEMONSQUEEZY_VARIANT_PRO) return 'pro';
  if (v === process.env.LEMONSQUEEZY_VARIANT_BUSINESS) return 'business';
  return null;
}

export function variantForPlan(plan: 'starter' | 'pro' | 'business'): string | null {
  if (plan === 'starter') return process.env.LEMONSQUEEZY_VARIANT_STARTER ?? null;
  if (plan === 'pro') return process.env.LEMONSQUEEZY_VARIANT_PRO ?? null;
  if (plan === 'business') return process.env.LEMONSQUEEZY_VARIANT_BUSINESS ?? null;
  return null;
}

type CheckoutResponse = {
  data: {
    attributes: {
      url: string;
    };
  };
};

/**
 * Create a hosted-checkout session and return its URL. The customer is
 * redirected to LemonSqueezy to pay; on success they land on `successUrl`.
 * `customData` is echoed back verbatim in the webhook payload — we stash
 * `org_id` and `plan` here so the webhook handler knows which org just paid.
 */
export async function createCheckout(params: {
  variantId: string;
  email: string;
  name?: string;
  customData: Record<string, string>;
  successUrl: string;
}): Promise<string> {
  const storeId = process.env.LEMONSQUEEZY_STORE_ID;
  const apiKey = process.env.LEMONSQUEEZY_API_KEY;
  if (!storeId || !apiKey) {
    throw new Error('LemonSqueezy is not configured (missing LEMONSQUEEZY_STORE_ID or LEMONSQUEEZY_API_KEY).');
  }

  const res = await fetch(`${LS_API_URL}/checkouts`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/vnd.api+json',
      Accept: 'application/vnd.api+json',
    },
    body: JSON.stringify({
      data: {
        type: 'checkouts',
        attributes: {
          checkout_data: {
            email: params.email,
            name: params.name,
            custom: params.customData,
          },
          product_options: {
            redirect_url: params.successUrl,
            receipt_button_text: 'Back to dashboard',
            receipt_link_url: params.successUrl,
          },
          checkout_options: {
            embed: false,
            media: false,
            logo: true,
          },
        },
        relationships: {
          store: { data: { type: 'stores', id: storeId } },
          variant: { data: { type: 'variants', id: params.variantId } },
        },
      },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`LemonSqueezy checkout creation failed: ${res.status} ${errText}`);
  }

  const json = (await res.json()) as CheckoutResponse;
  return json.data.attributes.url;
}

/**
 * Verify the X-Signature header against the raw request body. LemonSqueezy
 * signs every webhook with HMAC-SHA256 using the secret we set on the
 * webhook config. Constant-time comparison prevents timing attacks.
 */
export function verifyWebhookSignature(rawBody: string, signature: string | null): boolean {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  if (!secret || !signature) return false;
  const expected = createHmac('sha256', secret).update(rawBody).digest('hex');
  try {
    return timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(signature, 'hex'));
  } catch {
    return false;
  }
}

// Minimal type for the webhook payload we actually consume.
export type LemonSqueezyWebhookEvent = {
  meta: {
    event_name: string;
    custom_data?: Record<string, string>;
  };
  data: {
    type: string;
    id: string;
    attributes: {
      store_id: number;
      customer_id: number;
      variant_id: number;
      status: string;
      user_email?: string;
      user_name?: string;
      renews_at?: string | null;
      ends_at?: string | null;
    };
  };
};
