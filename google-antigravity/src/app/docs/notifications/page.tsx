import { DocHeader, P, Section, Steps, Step, CodeBlock, Code, Callout, NextPrev } from '../_components/DocComponents';

export const metadata = { title: 'Slack & Discord notifications — SmartDocs Docs' };

export default function NotificationsDocs() {
  return (
    <>
      <DocHeader
        eyebrow="Improving your bot"
        title="Slack & Discord notifications"
        lead="Get pinged when the bot can't answer something important. Configure once per chatbot."
      />

      <Section title="When notifications fire">
        <P>An outbound webhook is sent every time the bot escalates a question (returns <Code>[ESCALATE]</Code>). The payload includes the question, confidence score, and a link to the conversation.</P>
      </Section>

      <Section title="Setting it up">
        <Steps>
          <Step n={1} title="Get a webhook URL">
            In Slack, create an <b>Incoming Webhook</b> for the channel you want notifications in. In Discord, server settings → Integrations → Webhooks. Copy the URL.
          </Step>
          <Step n={2} title="Paste into the chatbot's Settings">
            Open the chatbot&apos;s <Code>Settings</Code> tab, paste into <b>Slack webhook URL</b>, toggle <b>Notify on escalation</b>, and save.
          </Step>
          <Step n={3} title="Test it">
            Send the bot a question you know it can&apos;t answer (e.g. &ldquo;what color is my dog&rdquo;). A formatted message should arrive in your Slack/Discord channel within seconds.
          </Step>
        </Steps>
      </Section>

      <Section title="Payload format">
        <CodeBlock lang="json">{`{
  "text": "*⚠️ Customer Support Bot couldn't answer a question*\\nQuestion: How do I get a refund for an order I placed in 2019?\\nConfidence: 0.18"
}`}</CodeBlock>
        <P>Both Slack and Discord accept the same <Code>{`{ text }`}</Code> body shape, so a single URL works for either.</P>
      </Section>

      <Callout tone="info" title="Plan availability">
        Slack/Discord notifications are a Pro feature. Business plans also get programmatic webhooks via the Developer API.
      </Callout>

      <NextPrev
        prev={{ href: '/docs/analytics', label: 'Analytics' }}
        next={{ href: '/docs/api/overview', label: 'API overview' }}
      />
    </>
  );
}
