import { DocHeader, P, Section, UL, Code, NextPrev } from '../_components/DocComponents';

export const metadata = { title: 'Analytics — SmartDocs Docs' };

export default function AnalyticsDocs() {
  return (
    <>
      <DocHeader
        eyebrow="Improving your bot"
        title="Analytics"
        lead="Understand how your chatbot is performing in production — what people ask, where it falls short, and how engagement is trending."
      />

      <Section title="Per-chatbot analytics tab">
        <P>From each chatbot, the <Code>Analytics</Code> tab shows the last 30 days:</P>
        <UL>
          <li><b>Total messages</b> — count of all assistant responses</li>
          <li><b>Escalation rate</b> — percentage of conversations the bot couldn&apos;t fully resolve</li>
          <li><b>Unanswered count</b> — number of distinct questions that triggered escalation</li>
          <li><b>Messages per day</b> — 7-day line chart</li>
          <li><b>Top topics</b> — clustered user questions, ranked by frequency</li>
          <li><b>Questions your bot couldn&apos;t answer</b> — top 5 escalated user questions</li>
        </UL>
      </Section>

      <Section title="Org overview dashboard">
        <P>The <Code>/dashboard</Code> overview rolls every chatbot together: total chatbots, total messages this month, sources indexed, and unanswered questions across all bots.</P>
      </Section>

      <Section title="CSV export">
        <P>From the Conversations tab, click <b>Export CSV</b> to download <Code>session_id, started_at, message_count, resolved</Code> for further analysis in your spreadsheet or BI tool.</P>
      </Section>

      <Section title="Real-time updates">
        <P>Source processing status polls every 3 seconds while any source is processing. Conversation lists refresh on demand. Stats counters are server-side and refresh on page navigation.</P>
      </Section>

      <NextPrev
        prev={{ href: '/docs/confidence', label: 'Confidence scoring' }}
        next={{ href: '/docs/notifications', label: 'Slack notifications' }}
      />
    </>
  );
}
