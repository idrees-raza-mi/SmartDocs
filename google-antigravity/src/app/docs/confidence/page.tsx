import { DocHeader, P, Section, UL, Code, Callout, NextPrev } from '../_components/DocComponents';

export const metadata = { title: 'Confidence scoring — DocWise Docs' };

export default function ConfidenceDocs() {
  return (
    <>
      <DocHeader
        eyebrow="Improving your bot"
        title="Confidence scoring"
        lead="Every assistant response is tagged with a 0–1 confidence score so you can spot risky answers."
      />

      <Section title="How it's calculated">
        <P>The score blends three signals:</P>
        <UL>
          <li><b>Top retrieval similarity.</b> The cosine similarity of the best-matching chunk for this question. Higher is better.</li>
          <li><b>Response length.</b> Very short responses get a lower bonus (the bot probably hedged).</li>
          <li><b>Escalation flag.</b> If the bot escalated, confidence drops to ~0.15 regardless of other signals.</li>
        </UL>
        <P>The result is stored on each assistant message and surfaced in the dashboard.</P>
      </Section>

      <Section title="Interpreting scores">
        <UL>
          <li><b>0.85+</b> — high confidence. The retrieved chunks closely matched the question.</li>
          <li><b>0.6–0.85</b> — medium. The bot found relevant material but had to interpret a bit.</li>
          <li><b>Below 0.6</b> — low. Treat as needing review — the answer may be technically correct but poorly grounded.</li>
        </UL>
      </Section>

      <Section title="Acting on low scores">
        <P>Filter the Conversations view by &ldquo;low confidence&rdquo; to spot answers worth reviewing. If many low-confidence answers cluster around a topic, your sources likely need more depth there.</P>
      </Section>

      <Callout tone="info" title="Plan availability">
        Confidence scoring is calculated for every chatbot regardless of plan. The dashboard filter to surface low-confidence answers is a Pro+ feature.
      </Callout>

      <NextPrev
        prev={{ href: '/docs/review-queue', label: 'Review queue' }}
        next={{ href: '/docs/analytics', label: 'Analytics' }}
      />
    </>
  );
}
