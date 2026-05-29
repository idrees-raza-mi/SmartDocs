import { DocHeader, P, Section, Steps, Step, Callout, NextPrev } from '../_components/DocComponents';

export const metadata = { title: 'Review queue — DocWise Docs' };

export default function ReviewQueueDocs() {
  return (
    <>
      <DocHeader
        eyebrow="Improving your bot"
        title="Review queue"
        lead="Turn every unanswered question into a permanent improvement to your knowledge base — automatically."
      />

      <P>
        When the bot can&apos;t answer a question, it escalates and the question lands in your Review Queue. You write the
        correct answer once; DocWise converts it into a new knowledge source and your bot uses it from the very next chat onward.
      </P>

      <Section title="How questions get queued">
        <P>Whenever the bot replies with the internal <code className="bg-white/10 text-amber-200 px-1 rounded">[ESCALATE]</code> marker, the original question is added to the queue. Repeated similar questions are clustered (case-insensitive prefix match) and a counter increments — so you see &ldquo;Asked 12 times&rdquo; instead of 12 separate entries.</P>
      </Section>

      <Section title="Resolving a question">
        <Steps>
          <Step n={1} title="Open the Review Queue">
            From the dashboard sidebar, click <b>Review Queue</b> for the org-wide view, or open a specific chatbot&apos;s <b>Review Queue</b> tab.
          </Step>
          <Step n={2} title="Click 'Answer' on a question">
            A text area opens. Write the correct response — markdown is supported.
          </Step>
          <Step n={3} title="Click 'Save & retrain'">
            DocWise creates a new Text source named &ldquo;Q: ...&rdquo; with content <code className="bg-white/10 text-amber-200 px-1 rounded">Q: question\nA: answer</code>, embeds it, and marks the question resolved.
          </Step>
        </Steps>
        <P>The whole loop usually completes in under 3 seconds. The next visitor who asks something similar gets your answer.</P>
      </Section>

      <Callout tone="success" title="Why Q/A format">
        Embedding both the question and the answer together means the question side gets matched on paraphrases (&ldquo;what&apos;s your cancellation policy&rdquo; &asymp; &ldquo;how do I cancel&rdquo;), while the answer side hitches a free ride into the retrieved context.
      </Callout>

      <Section title="Plan availability">
        <P>Review Queue is included on Pro and Business plans. On Trial and Starter, you can still see escalations in the dashboard analytics, but the auto-retrain action is gated behind Pro.</P>
      </Section>

      <NextPrev
        prev={{ href: '/docs/widget/security', label: 'Domain allowlist' }}
        next={{ href: '/docs/confidence', label: 'Confidence scoring' }}
      />
    </>
  );
}
