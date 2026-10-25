interface SiteMetaNote {
  created_at: string;
  updated_at: string;
}

interface SiteMetaProps {
  notes: SiteMetaNote[];
  categoryCount: number;
}

// 把 "2026-09-05 06:15:45" 格式化为 "2026.09.05"
function toDate(value: string) {
  return value.slice(0, 10).replace(/-/g, ".");
}

export default function SiteMeta({ notes, categoryCount }: SiteMetaProps) {
  const since = notes.length > 0 ? toDate(notes.reduce((a, b) => (a.created_at < b.created_at ? a : b)).created_at) : "--";
  const lastUpdated = notes.length > 0 ? toDate(notes.reduce((a, b) => (a.updated_at > b.updated_at ? a : b)).updated_at) : "--";

  const rows = [
    { label: "建站时间", value: since },
    { label: "文章总数", value: String(notes.length).padStart(2, "0") },
    { label: "分类", value: String(categoryCount).padStart(2, "0") },
    { label: "最近更新", value: lastUpdated },
  ];

  return (
    <div className="mt-10 lg:mt-auto rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md px-4 py-3.5 shadow-lg shadow-black/20">
      <p className="text-xs text-white/45 tracking-[0.25em] uppercase">Archive</p>
      <ul className="mt-2 divide-y divide-white/10">
        {rows.map((row) => (
          <li key={row.label} className="flex items-center justify-between py-2">
            <span className="text-xs text-white/50 tracking-wider">{row.label}</span>
            <span className="text-sm text-white/85 tabular-nums">{row.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
