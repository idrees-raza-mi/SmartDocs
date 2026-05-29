import Link from 'next/link';

export default async function SetupErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const { reason } = await searchParams;
  const isEnv = reason === 'env';
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const hasAnon = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const hasService = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
  const hasOpenAI = !!process.env.OPENAI_API_KEY;

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-[#0a0a0a] border border-red-500/30 rounded-2xl p-8 shadow-2xl">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl">⚠️</span>
          <h1 className="text-2xl font-bold tracking-tight">
            {isEnv ? 'Missing environment variables' : 'Supabase is unreachable'}
          </h1>
        </div>

        {isEnv ? (
          <>
            <p className="text-white/70 mb-4 text-sm leading-relaxed">
              The app can&apos;t start without Supabase credentials. Create{' '}
              <code className="bg-white/10 px-1.5 py-0.5 rounded text-amber-200">.env.local</code>{' '}
              in the project root (copy from <code className="bg-white/10 px-1.5 py-0.5 rounded text-amber-200">.env.example</code>) and fill in:
            </p>
            <ul className="text-sm font-mono space-y-1 mb-6 bg-black border border-white/10 rounded-lg p-4">
              <li className={hasAnon ? 'text-green-400' : 'text-red-400'}>
                {hasAnon ? '✓' : '✗'} NEXT_PUBLIC_SUPABASE_URL
              </li>
              <li className={hasAnon ? 'text-green-400' : 'text-red-400'}>
                {hasAnon ? '✓' : '✗'} NEXT_PUBLIC_SUPABASE_ANON_KEY
              </li>
              <li className={hasService ? 'text-green-400' : 'text-red-400'}>
                {hasService ? '✓' : '✗'} SUPABASE_SERVICE_ROLE_KEY
              </li>
              <li className={hasOpenAI ? 'text-green-400' : 'text-red-400'}>
                {hasOpenAI ? '✓' : '✗'} OPENAI_API_KEY
              </li>
            </ul>
            <p className="text-xs text-white/40 mb-6">
              Restart <code className="bg-white/10 px-1.5 py-0.5 rounded">npm run dev</code> after adding these.
            </p>
          </>
        ) : (
          <>
            <p className="text-white/70 mb-4 text-sm leading-relaxed">
              The app is configured but can&apos;t reach your Supabase project. Common causes:
            </p>
            <ol className="text-sm space-y-3 mb-6">
              <li className="bg-white/5 border border-white/10 rounded-lg p-4">
                <strong className="text-amber-200">1. Project is paused.</strong> Free-tier Supabase projects pause after
                7 days of inactivity. Open{' '}
                <a
                  className="text-blue-400 hover:underline"
                  href="https://supabase.com/dashboard"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  supabase.com/dashboard
                </a>{' '}
                and click <em>Restore project</em>.
              </li>
              <li className="bg-white/5 border border-white/10 rounded-lg p-4">
                <strong className="text-amber-200">2. Wrong URL or expired anon key.</strong> Verify the URL in{' '}
                <code className="bg-white/10 px-1.5 py-0.5 rounded">.env</code> matches the one in your
                Supabase project settings → API. Current URL:
                <code className="block mt-2 text-xs text-white/60 break-all">
                  {url ? url : '(not set)'}
                </code>
              </li>
              <li className="bg-white/5 border border-white/10 rounded-lg p-4">
                <strong className="text-amber-200">3. Stale browser cookies.</strong> If you previously used a different
                Supabase project, old session cookies may be lingering. Open DevTools → Application → Cookies →
                delete all <code className="bg-white/10 px-1.5 py-0.5 rounded">sb-*</code> cookies, then refresh.
              </li>
              <li className="bg-white/5 border border-white/10 rounded-lg p-4">
                <strong className="text-amber-200">4. Network / firewall.</strong> Try opening the Supabase URL in a
                browser tab. If it doesn&apos;t load, the issue is your network.
              </li>
            </ol>
          </>
        )}

        <div className="flex gap-3">
          <Link
            href="/"
            className="px-4 py-2 bg-white text-black rounded-lg font-bold text-sm hover:bg-gray-200 transition-colors"
          >
            Back to home
          </Link>
          <a
            href="/setup-error"
            className="px-4 py-2 bg-white/5 border border-white/10 text-white rounded-lg font-bold text-sm hover:bg-white/10 transition-colors"
          >
            Retry
          </a>
        </div>
      </div>
    </div>
  );
}
