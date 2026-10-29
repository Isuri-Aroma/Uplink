const TILE = {
  Fibre: ['FTTH', 'fibre'],
  VDSL: ['VDSL', 'vdsl'],
  '4G LTE': ['4G', 'wireless'],
  '5G': ['5G', 'wireless'],
};

// size: '' (32px), 'md' (40px), 'lg' (56px)
export default function TechTile({ technology, size = '' }) {
  const [label, tone] = TILE[technology] || ['—', 'vdsl'];
  return (
    <span className={`tech-tile tech-tile--${tone} ${size ? `tech-tile--${size}` : ''}`} title={technology}>
      {label}
    </span>
  );
}
