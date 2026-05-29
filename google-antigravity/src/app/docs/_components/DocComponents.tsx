import Link from 'next/link';
import { ArrowRight, Info, WarningCircle, CheckCircle, CaretRight } from '@phosphor-icons/react/dist/ssr';

export function DocHeader({ eyebrow, title, lead }: { eyebrow?: string; title: string; lead?: string }) {
  return (
    <header className="mb-10">
      {eyebrow && (
        <div className="text-xs uppercase tracking-widest text-white/40 font-bold mb-3">{eyebrow}</div>
      )}
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-3">{title}</h1>
      {lead && <p className="text-lg text-white/60 leading-relaxed">{lead}</p>}
    </header>
  );
}

export function Section({ title, id, children }: { title: string; id?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mt-12">
      <h2 className="text-xl font-bold text-white tracking-tight mb-4 pb-2 border-b border-white/5">{title}</h2>
      <div className="prose-doc">{children}</div>
    </section>
  );
}

export function P({ children }: { children: React.ReactNode }) {
  return <p className="text-[15px] text-white/70 leading-relaxed mb-4">{children}</p>;
}

export function UL({ children }: { children: React.ReactNode }) {
  return <ul className="text-[15px] text-white/70 leading-relaxed mb-4 space-y-2 list-disc pl-5 marker:text-white/30">{children}</ul>;
}

export function OL({ children }: { children: React.ReactNode }) {
  return <ol className="text-[15px] text-white/70 leading-relaxed mb-4 space-y-2 list-decimal pl-5 marker:text-white/30">{children}</ol>;
}

export function Code({ children }: { children: React.ReactNode }) {
  return <code className="bg-white/10 text-amber-200 px-1.5 py-0.5 rounded text-[13px] font-mono">{children}</code>;
}

export function CodeBlock({ lang, children }: { lang?: string; children: string }) {
  return (
    <div className="my-5 rounded-xl border border-white/10 bg-[#070707] overflow-hidden">
      {lang && (
        <div className="px-4 py-2 border-b border-white/5 text-xs text-white/40 font-mono uppercase tracking-wider">
          {lang}
        </div>
      )}
      <pre className="p-4 overflow-x-auto text-[13px] leading-relaxed">
        <code className="font-mono text-white/85">{children}</code>
      </pre>
    </div>
  );
}

const calloutTones = {
  info: { icon: Info, color: 'text-blue-300', bg: 'bg-blue-500/5', border: 'border-blue-500/20' },
  warning: { icon: WarningCircle, color: 'text-amber-300', bg: 'bg-amber-500/5', border: 'border-amber-500/20' },
  success: { icon: CheckCircle, color: 'text-green-300', bg: 'bg-green-500/5', border: 'border-green-500/20' },
};

export function Callout({
  tone = 'info',
  title,
  children,
}: {
  tone?: keyof typeof calloutTones;
  title?: string;
  children: React.ReactNode;
}) {
  const t = calloutTones[tone];
  const Icon = t.icon;
  return (
    <div className={`my-5 p-4 rounded-xl border ${t.border} ${t.bg} flex gap-3`}>
      <Icon size={18} weight="fill" className={`${t.color} shrink-0 mt-0.5`} />
      <div className="text-[14px] text-white/75 leading-relaxed">
        {title && <div className={`font-bold mb-1 ${t.color}`}>{title}</div>}
        {children}
      </div>
    </div>
  );
}

export function Steps({ children }: { children: React.ReactNode }) {
  return <div className="my-6 space-y-5">{children}</div>;
}

export function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <div className="shrink-0 w-7 h-7 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-xs font-bold text-white">
        {n}
      </div>
      <div className="flex-1 min-w-0 pt-0.5">
        <h3 className="text-base font-bold text-white mb-1.5">{title}</h3>
        <div className="text-[14px] text-white/65 leading-relaxed">{children}</div>
      </div>
    </div>
  );
}

export function CardGrid({ children }: { children: React.ReactNode }) {
  return <div className="my-6 grid grid-cols-1 sm:grid-cols-2 gap-3">{children}</div>;
}

export function Card({ href, title, desc }: { href: string; title: string; desc: string }) {
  return (
    <Link
      href={href}
      className="block p-5 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/5 hover:border-white/20 transition-all group"
    >
      <div className="flex items-center justify-between mb-1.5">
        <h3 className="text-sm font-bold text-white">{title}</h3>
        <CaretRight size={14} className="text-white/30 group-hover:text-white/60 group-hover:translate-x-0.5 transition-all" />
      </div>
      <p className="text-xs text-white/50 leading-relaxed">{desc}</p>
    </Link>
  );
}

export function NextPrev({
  prev,
  next,
}: {
  prev?: { href: string; label: string };
  next?: { href: string; label: string };
}) {
  return (
    <div className="mt-16 pt-6 border-t border-white/5 flex items-center justify-between gap-4">
      {prev ? (
        <Link
          href={prev.href}
          className="flex items-center gap-2 px-4 py-3 rounded-xl border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all text-sm"
        >
          <ArrowRight size={14} className="rotate-180 text-white/40" />
          <div>
            <div className="text-[10px] uppercase tracking-wider text-white/40 font-bold">Previous</div>
            <div className="text-white font-medium">{prev.label}</div>
          </div>
        </Link>
      ) : (
        <span />
      )}
      {next && (
        <Link
          href={next.href}
          className="flex items-center gap-2 px-4 py-3 rounded-xl border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all text-sm ml-auto text-right"
        >
          <div>
            <div className="text-[10px] uppercase tracking-wider text-white/40 font-bold">Next</div>
            <div className="text-white font-medium">{next.label}</div>
          </div>
          <ArrowRight size={14} className="text-white/40" />
        </Link>
      )}
    </div>
  );
}
