import { ShieldCheck, GlobeHemisphereWest, Lightning, Lock, Database } from '@phosphor-icons/react/dist/ssr';

const ITEMS = [
  { icon: ShieldCheck, label: 'SOC 2 (in progress)' },
  { icon: GlobeHemisphereWest, label: 'GDPR ready' },
  { icon: Lightning, label: '99.9% uptime SLA' },
  { icon: Lock, label: 'No training on your data' },
  { icon: Database, label: 'US & EU regions' },
];

export const TrustStrip = () => {
  return (
    <section className="py-10 px-6 sm:px-12 border-y border-white/5 bg-[#050505]">
      <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
        {ITEMS.map(({ icon: Icon, label }, i) => (
          <div key={i} className="flex items-center gap-2 text-white/40 text-xs uppercase tracking-wider font-medium">
            <Icon size={14} weight="bold" className="text-white/30" />
            <span>{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
};
