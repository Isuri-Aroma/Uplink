const lkrFormat = new Intl.NumberFormat('en-LK');

export const lkr = (n) => `LKR ${lkrFormat.format(n ?? 0)}`;

export const speed = (down, up) => `${down} / ${up} Mbps`;

export const dataCap = (gb) => (gb ? `${lkrFormat.format(gb)} GB` : 'Unlimited');

export const shortDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

export const dateTime = (d) =>
  d ? new Date(d).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';
