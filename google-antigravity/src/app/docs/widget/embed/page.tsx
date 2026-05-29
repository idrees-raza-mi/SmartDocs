import { DocHeader, P, Section, CodeBlock, Code, Callout, NextPrev } from '../../_components/DocComponents';

export const metadata = { title: 'Embed snippet — SmartDocs Docs' };

export default function EmbedDocs() {
  return (
    <>
      <DocHeader
        eyebrow="Widget"
        title="Embed snippet"
        lead="One line of HTML adds the SmartDocs chat bubble to any website."
      />

      <Section title="The snippet">
        <CodeBlock lang="html">{`<script
  src="https://YOUR-APP.com/widget.js"
  data-chatbot-id="YOUR-CHATBOT-ID"
  defer
></script>`}</CodeBlock>
        <P>Drop this just before the closing <Code>&lt;/body&gt;</Code> tag. The <Code>defer</Code> attribute ensures it loads after your page renders.</P>
      </Section>

      <Section title="What gets loaded">
        <P>The script is around 12 KB gzipped. It injects a floating bubble, listens for clicks, and opens an in-page chat window. On click, it fetches your chatbot configuration (name, colors, welcome message) from <Code>/api/chat/config</Code>.</P>
        <P>The widget runs in pure JavaScript — no React, no global styles bleed into your page. All CSS is scoped to <Code>#sd-widget-container</Code>.</P>
      </Section>

      <Section title="Framework integration">
        <P>The snippet works as-is in plain HTML. For frameworks:</P>
        <CodeBlock lang="next.js">{`// app/layout.tsx
import Script from 'next/script';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Script
          src="https://YOUR-APP.com/widget.js"
          data-chatbot-id="YOUR-CHATBOT-ID"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}`}</CodeBlock>
        <CodeBlock lang="react (vite, cra, etc.)">{`// App.jsx
useEffect(() => {
  const s = document.createElement('script');
  s.src = 'https://YOUR-APP.com/widget.js';
  s.setAttribute('data-chatbot-id', 'YOUR-CHATBOT-ID');
  s.defer = true;
  document.body.appendChild(s);
}, []);`}</CodeBlock>
      </Section>

      <Callout tone="warning" title="Caching">
        The widget is served with a 5-minute cache header. If you change customization (colors, welcome message) it takes up to 5 minutes to appear on already-loaded pages. Hard-refresh to see changes immediately.
      </Callout>

      <NextPrev
        prev={{ href: '/docs/sources/sync', label: 'Auto re-sync' }}
        next={{ href: '/docs/widget/customize', label: 'Customize appearance' }}
      />
    </>
  );
}
