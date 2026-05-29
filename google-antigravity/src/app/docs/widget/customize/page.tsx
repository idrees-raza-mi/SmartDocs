import { DocHeader, P, Section, UL, Code, Callout, NextPrev } from '../../_components/DocComponents';

export const metadata = { title: 'Customize widget — SmartDocs Docs' };

export default function CustomizeDocs() {
  return (
    <>
      <DocHeader
        eyebrow="Widget"
        title="Customize the widget"
        lead="Tune the chatbot's appearance, voice, and behavior — no code required."
      />

      <Section title="Visual customization">
        <P>From the chatbot&apos;s <Code>Embed</Code> tab:</P>
        <UL>
          <li><b>Accent color.</b> Used for the bubble, header, send button, and user-message bubbles. Foreground text color is auto-computed for contrast.</li>
          <li><b>Widget position.</b> Bottom-right (default) or bottom-left.</li>
          <li><b>Branding badge.</b> &ldquo;Powered by SmartDocs&rdquo; appears at the bottom of the widget on trial and Starter plans. Pro and Business plans can hide it from the <Code>Settings</Code> tab.</li>
        </UL>
      </Section>

      <Section title="Voice & behavior">
        <P>From the chatbot&apos;s <Code>Settings</Code> tab:</P>
        <UL>
          <li><b>Name.</b> The bot&apos;s display name in the header.</li>
          <li><b>Welcome message.</b> The first message visitors see when they open the widget. Use it to set expectations or suggest a starter question.</li>
          <li><b>Input placeholder.</b> The greyed-out text in the message box.</li>
          <li><b>System prompt.</b> Instructions that shape the bot&apos;s tone and personality. Example: <Code>You are a cheerful customer success rep. Use emojis sparingly. Always end with an offer to help further.</Code></li>
        </UL>
      </Section>

      <Section title="Suggested starter questions">
        <P>Provide up to 3 example questions that appear as clickable chips when a visitor opens the widget. Great for guiding first-time users to your most common use cases.</P>
      </Section>

      <Callout tone="info" title="Live preview">
        The Embed tab includes a live preview that updates as you change settings. Use it to test color and copy choices before saving.
      </Callout>

      <NextPrev
        prev={{ href: '/docs/widget/embed', label: 'Embed snippet' }}
        next={{ href: '/docs/widget/lead-capture', label: 'Lead capture' }}
      />
    </>
  );
}
