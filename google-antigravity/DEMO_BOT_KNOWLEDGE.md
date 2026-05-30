# DocWise — Demo Bot Knowledge Source

This file is the source-of-truth knowledge base for the live DocWise demo
bot. Paste the entire contents into the dashboard as a single Raw Text
source with name `DocWise FAQ`.

Format is Q/A pairs because Gemini embeddings match user questions against
the question side, and the answer hitches a ride into the prompt context.

---

Q: What is DocWise?
A: DocWise is an AI chatbot platform. You train it on your own documentation, FAQs, or knowledge base, and it answers your visitors' questions in real time. You embed it on your website with one line of HTML. It's designed to never hallucinate — it only answers from your sources.

Q: How does DocWise work?
A: You upload knowledge sources (URLs, PDFs, docs, raw text). DocWise extracts the text, chunks it, generates embeddings, and stores them in a vector database. When a visitor asks a question, DocWise embeds the question, searches for the most relevant chunks, and feeds them to Google Gemini, which generates a grounded answer.

Q: Will DocWise hallucinate or make up answers?
A: No. DocWise is configured with strict retrieval-augmented generation (RAG). If the answer to a question is not in your sources, the bot says "I don't know" and offers to connect the visitor with a human. It never invents facts.

Q: Which AI model does DocWise use?
A: DocWise uses Google Gemini 2.5 Flash for chat responses and Gemini Embedding 001 for vector embeddings. Both run on Google's API. Fallback chat models include Gemini 2.5 Flash Lite, 2.0 Flash Lite, and 2.0 Flash Exp — so if Google deprecates one model, your bot keeps working.

Q: How fast does the bot respond?
A: Most responses start streaming within 600 milliseconds. The full retrieval + first token usually takes under one second on a typical query.

Q: How much does DocWise cost?
A: There are four tiers. Free is $0 per month forever with 1 chatbot, 1 source, and 50 messages per month. Starter is $29 per month with 1 chatbot, 5 sources, and 500 messages per month plus analytics. Pro is $79 per month with 5 chatbots, unlimited sources, 5,000 messages per month, sitemap crawling, the Review Queue, and Slack notifications. Business is $199 per month with unlimited chatbots, 50,000 messages, REST API access, webhooks, audit log, white-label widget, and custom domain.

Q: Is there a free plan?
A: Yes. The Free tier is permanent — no time limit, no credit card required. You get 1 chatbot, 1 source, and 50 messages per month with DocWise branding shown.

Q: Is there a free trial?
A: Every new account gets a 7-day trial with Starter-tier benefits (1 chatbot, 5 sources, 500 messages, analytics, lead capture). After the trial you automatically drop to the Free tier — you don't lose access, you just have reduced limits.

Q: Do I need a credit card to sign up?
A: No. The Free tier and 7-day trial are both available without a credit card.

Q: How do I cancel my subscription?
A: Open Billing in the dashboard and click "Manage subscription". You'll be redirected to the LemonSqueezy billing portal where you can cancel with one click. Your service continues through the end of the current billing period.

Q: Can I get a refund?
A: We process refunds case-by-case. Email support@docwise.ai with your account email and reason. We typically refund unused months within 30 days of charge.

Q: Which payment methods do you accept?
A: All major credit cards and PayPal, processed via LemonSqueezy. LemonSqueezy is our merchant of record and handles VAT, GST, and sales tax automatically based on your country.

Q: What knowledge sources can I upload?
A: URLs (any public web page), PDF files, DOCX (Word), TXT (plain text), MD (Markdown), CSV, JSON, sitemaps, and Raw Text you paste directly. Maximum file size is 25 MB per file.

Q: Can the bot crawl an entire docs site?
A: Yes, on the Pro plan and above. Paste a sitemap.xml URL and DocWise crawls up to 200 URLs on Pro or 2,000 URLs on Business. Each URL is processed independently and added as a source.

Q: Can I update my sources after creating the bot?
A: Yes. Add new sources anytime — they take effect immediately for new conversations. URL sources can be re-synced on demand or on a daily, weekly, or monthly schedule (Pro and above).

Q: What happens to my sources if I cancel?
A: Your data stays in our database for 30 days after cancellation in case you change your mind. After 30 days everything is purged. You can export everything at any time via the Profile page.

Q: How do I embed the chatbot on my website?
A: Copy the embed snippet from the chatbot's Embed tab. It looks like a one-line script tag. Paste it just before the closing body tag on any page where you want the chat bubble to appear. Works on every framework — React, Vue, plain HTML, WordPress, Webflow, Shopify, anything.

Q: Will the widget slow down my website?
A: No. The widget script is around 12 KB gzipped and loads asynchronously after your page finishes rendering. It never blocks anything.

Q: Can I customize the appearance of the widget?
A: Yes. Change accent color, welcome message, input placeholder, name, and position (bottom-right or bottom-left) from the chatbot's settings. On Pro and above you can remove DocWise branding from the bottom of the widget.

Q: Can I restrict which websites can use my chatbot?
A: Yes. Add domains to the Allowed Domains list in the Embed tab. Anyone trying to use the widget from a different domain gets a 403 error. Subdomains are matched automatically — adding example.com allows blog.example.com.

Q: Does the bot have conversation memory?
A: Yes. Each visitor's session is identified and the bot remembers the last 10 messages of context. Follow-up questions like "tell me more about that" work naturally.

Q: Can the bot speak languages other than English?
A: Yes. Gemini understands and responds in 100+ languages. Upload English docs and ask questions in Spanish, French, German, Arabic, Urdu, or any other language — the bot translates on the fly.

Q: Can I capture leads from the chat?
A: Yes. Configure the lead capture mode in the chatbot's settings: off, optional, required, or after-first-message. The widget shows an email + name form at the configured trigger point. Captured leads appear in the conversation row in the dashboard and in CSV exports.

Q: What is the Review Queue?
A: Every question the bot couldn't answer lands in the Review Queue. You write the correct answer once and DocWise saves it as a new Text source, embeds it, and uses it from the next chat onward. It's a self-improving knowledge base. Available on Pro and above.

Q: What is confidence scoring?
A: Every assistant message gets a 0-1 confidence score based on retrieval similarity, response length, and escalation signal. Low-confidence answers are surfaced in the analytics dashboard so you can spot risky responses. Available on Pro and above.

Q: What analytics do I get?
A: Per-chatbot you see total messages, escalation rate (percentage of questions the bot couldn't answer), unanswered count, a 7-day messages-per-day chart, top topics (clustered user questions), and the top 5 unanswered questions. Available on Starter and above.

Q: Can I get notified when the bot escalates a question?
A: Yes. Configure a Slack or Discord webhook URL in the chatbot's settings (Pro and above). DocWise posts a message every time the bot can't answer something.

Q: Does DocWise have an API?
A: Yes, on the Business plan. The REST API exposes the chat endpoint at POST /api/v1/chat. Authenticate with Bearer API keys (format: dw_live_*). Generate keys from the Developer page in the dashboard. Webhooks are also available.

Q: Where is my data stored?
A: On Supabase Postgres. Choose US or EU region during signup. All connections use TLS and data at rest is encrypted by Supabase.

Q: Do you train AI models on my content?
A: No. We never train language models on your content. Your sources stay yours. OpenAI's competitor Anthropic doesn't either, but for DocWise specifically, Google Gemini's enterprise tier (which we use on paid plans) has data privacy by default.

Q: Is DocWise GDPR compliant?
A: Yes. You can export or delete all your data at any time from /dashboard/profile. GDPR and CCPA data requests are honored within 30 days. The widget has an optional GDPR consent banner you can enable per chatbot.

Q: Can I export my data?
A: Yes. Profile page → Export your data → download a JSON archive of your account, chatbots, sources, conversations, and messages.

Q: Can I delete my account?
A: Yes. Profile page → Delete account → type your email to confirm. Everything is purged: chatbots, sources, conversations, messages, audit logs, API keys.

Q: What support do you offer?
A: Free and Starter plans get email support with 48-hour response. Pro plans get priority email with 24-hour response. Business plans get a 4-hour SLA during business hours. Contact support@docwise.ai.

Q: How fast can I get started?
A: Around 10 minutes from signup to a working embedded chatbot. Create chatbot → add one source (paste a URL or upload a PDF) → wait 30 seconds for processing → copy embed snippet → paste into your site. Done.

Q: Why should I use DocWise instead of Intercom Fin or Chatbase?
A: DocWise is cheaper at every tier (Starter is $29 vs Intercom's $74 per seat), gives you a permanent free tier (Chatbase doesn't), has the self-improving Review Queue (no competitor has this), shows source citations under every answer (Chatbase doesn't), and is fully transparent on pricing (no "Contact us" plans).

Q: Can I white-label the widget with my own brand?
A: Yes, on the Business plan. Remove DocWise branding, use your own domain for the widget (CNAME setup), and customize CSS injection.

Q: Do you have an affiliate program?
A: Not yet — we're focused on building the core product first. Email affiliates@docwise.ai if you want to be notified when we launch the program.

Q: Who built DocWise?
A: DocWise is built by a solo founder. The product is bootstrapped, with no investors. Email hello@docwise.ai to reach the founder directly.

Q: Can I host DocWise myself?
A: Not currently — DocWise is hosted SaaS only. Self-hosting may come later for Business / Enterprise customers.

Q: How do I add documentation that's behind a login?
A: Login-walled content can't be crawled via URL ingestion. Upload the content directly as a PDF, DOCX, or Raw Text source instead.

Q: What if my PDF has images or scanned text?
A: DocWise extracts text from PDFs but doesn't OCR scanned images. If your PDF is a scanned document with no selectable text, run it through OCR first (Google Drive can do this for free) then upload the resulting text-extractable PDF or paste the OCR text as a Raw Text source.

Q: Can I have multiple chatbots for different products?
A: Yes. Starter gets 1 chatbot, Pro gets 5, Business gets unlimited. Each chatbot has its own sources, settings, conversations, and embed snippet. You can use them on the same site or different sites.

Q: How do I share access with my team?
A: Currently each account is single-user. Team invites are on the roadmap for the Business plan.

Q: What's a "chunk"?
A: When you upload a source, DocWise splits the text into roughly 400-token chunks with 50-token overlap. Each chunk is embedded separately and the bot retrieves the top 5 most relevant chunks per question. Chunk count appears in your Sources table.

Q: Why do some answers have citations and others don't?
A: Every assistant response that came from a retrieved chunk shows the source name as a chip. If the response is an escalation ("I don't know"), there are no citations because no chunk was used.

Q: Can the bot escalate to a real human?
A: Yes. When the bot doesn't have an answer it offers to connect the visitor with a human. If you enabled lead capture, the visitor can submit their email — you get notified and respond. Future versions will include live takeover where you can join the conversation in real time.

Q: What if the bot answers wrong?
A: First, check whether the right info exists in your sources. If yes, the embedding may not have matched well — add a Q/A pair to your sources covering that specific question. If no, add the information as a new source. The Review Queue auto-clusters bad answers so you don't have to find them manually.

Q: Does it work on mobile?
A: Yes. The widget is fully responsive — full screen on phones, sized for tablets, with proper iOS safe-area handling, no auto-zoom on input focus, and touch targets sized for fingers.

Q: Can my visitors mark responses as helpful or not?
A: Yes. Every bot response has thumbs-up and thumbs-down buttons. Feedback is stored against the message and visible in your dashboard so you can find what's working and what isn't.
