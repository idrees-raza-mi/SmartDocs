import { DocHeader, P, Section, UL, Code, Callout, NextPrev } from '../_components/DocComponents';

export const metadata = { title: 'Privacy & data — SmartDocs Docs' };

export default function PrivacyDocs() {
  return (
    <>
      <DocHeader
        eyebrow="Account"
        title="Privacy & data"
        lead="What we collect, where it lives, and how to control or delete it."
      />

      <Section title="What we collect">
        <UL>
          <li>Your account email and the name you provide</li>
          <li>Knowledge content you upload (documents, URLs, extracted text)</li>
          <li>Conversations between visitors and your chatbots</li>
          <li>Basic technical metadata (IP, user agent) for security and rate limiting</li>
        </UL>
      </Section>

      <Section title="What we don't do">
        <UL>
          <li><b>We never train language models on your content.</b> Your sources stay yours; OpenAI processes them only to generate embeddings and chat completions, with API-tier data isolation.</li>
          <li><b>We never sell your data.</b></li>
          <li><b>We never read your conversations</b> except to debug at your explicit request.</li>
        </UL>
      </Section>

      <Section title="Storage">
        <P>Data lives in Supabase Postgres. Choose a US or EU region when creating your project. All connections are TLS; data at rest is encrypted by Supabase.</P>
      </Section>

      <Section title="Subprocessors">
        <UL>
          <li><b>Supabase</b> — database, auth, storage</li>
          <li><b>OpenAI</b> — embeddings and chat completions (API tier; no training on your data per OpenAI&apos;s policy)</li>
          <li><b>Stripe</b> — payment processing</li>
          <li><b>Resend</b> — transactional email</li>
          <li><b>Vercel</b> — application hosting</li>
        </UL>
      </Section>

      <Section title="Your rights">
        <P>From <Code>/dashboard/profile</Code>:</P>
        <UL>
          <li><b>Export.</b> Download a JSON archive of your account, chatbots, sources, conversations, and messages.</li>
          <li><b>Delete.</b> Type your email to confirm — this purges everything, including audit logs.</li>
        </UL>
        <P>GDPR and CCPA data requests are honored within 30 days.</P>
      </Section>

      <Section title="Visitor data">
        <P>End users who chat with your bot are not registered SmartDocs users. We store their conversation content under the chatbot owner&apos;s organization. Owners are responsible for surfacing the GDPR consent banner (configurable per chatbot) to comply with EU regulations.</P>
      </Section>

      <Callout tone="info" title="Data retention">
        Conversations older than the plan retention window (Trial: 30d, Starter/Pro: 90d, Business: 365d) are automatically purged weekly.
      </Callout>

      <NextPrev
        prev={{ href: '/docs/billing', label: 'Plans & billing' }}
        next={{ href: '/docs/troubleshooting', label: 'Troubleshooting' }}
      />
    </>
  );
}
