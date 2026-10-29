const TILE = {
  Fibre: ['FTTH', 'bg-primary-soft text-primary'],
  VDSL: ['VDSL', 'bg-off-soft text-off'],
  '4G LTE': ['4G', 'bg-accent/10 text-accent'],
  '5G': ['5G', 'bg-accent/10 text-accent'],
};

export default function TechTile({ technology, size = 'h-8 w-8' }) {
  const [label, tone] = TILE[technology] || ['—', 'bg-off-soft text-off'];
  return (
    <span className={`grid shrink-0 place-items-center rounded-lg font-mono text-[10px] font-bold ${size} ${tone}`} title={technology}>
      {label}
    </span>
  );
}
