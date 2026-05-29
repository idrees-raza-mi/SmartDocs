import { DocHeader, P, Section, UL, Code, Callout, NextPrev } from '../../_components/DocComponents';

export const metadata = { title: 'Lead capture — DocWise Docs' };

export default function LeadCaptureDocs() {
  return (
    <>
      <DocHeader
        eyebrow="Widget"
        title="Lead capture"
        lead="Collect visitor emails directly inside the chat. Surface them in the dashboard, export to CRM, or trigger a follow-up email."
      />

      <Section title="Modes">
        <P>From <Code>Settings</Code> on each chatbot, choose one of:</P>
        <UL>
          <li><b>Off</b> — never asks for contact info.</li>
          <li><b>Optional</b> — shows a dismissible &ldquo;Stay in touch&rdquo; card after the first bot response.</li>
          <li><b>Required</b> — visitor must enter an email before sending a second message.</li>
          <li><b>After first message</b> — shows the form after the bot&apos;s first reply, but lets the visitor skip.</li>
        </UL>
      </Section>

      <Section title="What gets captured">
        <UL>
          <li>Email (required)</li>
          <li>Name (optional)</li>
          <li>The session ID linking the lead to the full conversation transcript</li>
        </UL>
      </Section>

      <Section title="Auto-prompt on escalation">
        <P>Even when lead capture mode is &ldquo;optional&rdquo;, the widget automatically shows the form when the bot has to escalate (couldn&apos;t answer a question). Phrasing in this case is friendlier: &ldquo;Want a human to reach out?&rdquo;</P>
      </Section>

      <Section title="Where leads appear">
        <P>Captured leads show up on the conversation row in the chatbot&apos;s <Code>Conversations</Code> tab and are included in CSV exports. Pro+ plans get a daily digest email summarizing new leads.</P>
      </Section>

      <Callout tone="info" title="Privacy">
        Leads are stored in your Supabase database, scoped to your organization. Visitors are shown the GDPR consent banner (if enabled on the chatbot) before any data is sent.
      </Callout>

      <NextPrev
        prev={{ href: '/docs/widget/customize', label: 'Customize widget' }}
        next={{ href: '/docs/widget/security', label: 'Domain allowlist' }}
      />
    </>
  );
}
