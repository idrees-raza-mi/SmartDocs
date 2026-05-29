import { DocHeader, P, Section, CodeBlock, Code, NextPrev } from '../../_components/DocComponents';

export const metadata = { title: 'POST /v1/chat — DocWise Docs' };

export default function ApiChatDocs() {
  return (
    <>
      <DocHeader
        eyebrow="Developer · Reference"
        title="POST /v1/chat"
        lead="Send a message to a chatbot and receive a complete response. Same retrieval pipeline as the widget — just JSON instead of streaming."
      />

      <Section title="Endpoint">
        <CodeBlock>{`POST https://YOUR-APP.com/api/v1/chat`}</CodeBlock>
      </Section>

      <Section title="Request body">
        <CodeBlock lang="json">{`{
  "chatbotId": "f2e9c5b4-...",
  "message":   "How do I cancel my subscription?",
  "sessionId": "user-12345"
}`}</CodeBlock>
        <ul className="list-disc pl-5 text-white/70 space-y-1 mb-4">
          <li><Code>chatbotId</Code> — UUID of the chatbot. Must belong to the org owning the API key.</li>
          <li><Code>message</Code> — visitor&apos;s question. Max 4,000 characters.</li>
          <li><Code>sessionId</Code> — any string identifying the conversation. Reuse the same value to give the bot conversation memory.</li>
        </ul>
      </Section>

      <Section title="Response">
        <CodeBlock lang="json">{`{
  "message":   "Open Billing in the dashboard and click 'Cancel plan.'",
  "sources":   ["policies.md", "faq.txt"],
  "escalated": false
}`}</CodeBlock>
        <ul className="list-disc pl-5 text-white/70 space-y-1 mb-4">
          <li><Code>message</Code> — the bot&apos;s answer, markdown formatted.</li>
          <li><Code>sources</Code> — unique source names used to compose the answer.</li>
          <li><Code>escalated</Code> — true when the bot couldn&apos;t find an answer.</li>
        </ul>
      </Section>

      <Section title="Examples">
        <CodeBlock lang="curl">{`curl -X POST https://YOUR-APP.com/api/v1/chat \\
  -H "Authorization: Bearer dw_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "chatbotId": "f2e9c5b4-...",
    "message": "How do I cancel?",
    "sessionId": "session-1"
  }'`}</CodeBlock>

        <CodeBlock lang="node.js">{`const res = await fetch('https://YOUR-APP.com/api/v1/chat', {
  method: 'POST',
  headers: {
    'Authorization': \`Bearer \${process.env.DOCWISE_KEY}\`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    chatbotId: 'f2e9c5b4-...',
    message: 'How do I cancel?',
    sessionId: 'session-1',
  }),
});
const data = await res.json();
console.log(data.message);`}</CodeBlock>

        <CodeBlock lang="python">{`import requests, os

res = requests.post(
    "https://YOUR-APP.com/api/v1/chat",
    headers={"Authorization": f"Bearer {os.environ['DOCWISE_KEY']}"},
    json={
        "chatbotId": "f2e9c5b4-...",
        "message": "How do I cancel?",
        "sessionId": "session-1",
    },
)
print(res.json()["message"])`}</CodeBlock>
      </Section>

      <NextPrev
        prev={{ href: '/docs/api/overview', label: 'API overview' }}
        next={{ href: '/docs/api/keys', label: 'API keys' }}
      />
    </>
  );
}
