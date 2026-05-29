import { DocHeader, P, Section, UL, Code, Callout, NextPrev } from '../../_components/DocComponents';

export const metadata = { title: 'Auto re-sync — SmartDocs Docs' };

export default function SyncDocs() {
  return (
    <>
      <DocHeader
        eyebrow="Knowledge sources"
        title="Auto re-sync"
        lead="Keep your bot's knowledge fresh without manual refreshes."
      />

      <Section title="Manual re-sync">
        <P>Any URL source can be re-synced from the refresh icon in the source row. We re-fetch the page and only re-embed if the content actually changed (content-hash check).</P>
      </Section>

      <Section title="Scheduled re-sync (Pro & Business)">
        <P>On Pro and Business plans, each URL source can be configured to refresh automatically:</P>
        <UL>
          <li><b>Daily</b> — overnight refresh, ideal for fast-moving docs sites</li>
          <li><b>Weekly</b> — Sunday refresh, fits most product documentation</li>
          <li><b>Monthly</b> — for stable reference material</li>
        </UL>
        <P>Sitemap sources re-crawl the full sitemap on the same schedule, adding any new URLs and re-syncing existing ones.</P>
      </Section>

      <Section title="How re-sync affects conversations">
        <P>Re-syncing is non-blocking — visitors continue to get answers from the cached chunks while a refresh runs in the background. When the refresh completes, the new chunks replace the old ones atomically.</P>
      </Section>

      <Callout tone="info" title="Cost-aware">
        Unchanged content is detected via SHA-256 content hashing. If the page hasn&apos;t changed since the last sync, no OpenAI embedding cost is incurred.
      </Callout>

      <NextPrev
        prev={{ href: '/docs/sources/text', label: 'Raw text' }}
        next={{ href: '/docs/widget/embed', label: 'Embed snippet' }}
      />
    </>
  );
}
