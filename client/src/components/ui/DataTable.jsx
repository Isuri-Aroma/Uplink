import EmptyState from './EmptyState';

// Table on desktop, cards on phones
export default function DataTable({ columns, rows, loading, empty, onRowClick, rowKey = '_id' }) {
  if (loading) {
    return (
      <div className="card divide-y divide-line" aria-busy="true">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex gap-4 p-4">
            <div className="h-4 w-1/4 animate-pulse rounded bg-line" />
            <div className="h-4 w-1/3 animate-pulse rounded bg-line" />
          </div>
        ))}
      </div>
    );
  }
  if (!rows.length) return <EmptyState {...empty} />;

  const click = (row) => onRowClick && onRowClick(row);

  return (
    <>
      <div className="card hidden overflow-x-auto md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left">
              {columns.map((c) => (
                <th key={c.key} className={`px-4 py-3 text-xs font-bold uppercase tracking-wide text-muted ${c.align === 'right' ? 'text-right' : ''}`}>
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row[rowKey]}
                onClick={() => click(row)}
                className={`border-b border-line last:border-0 ${onRowClick ? 'cursor-pointer hover:bg-primary-soft/40' : ''}`}
              >
                {columns.map((c) => (
                  <td key={c.key} className={`px-4 py-3 align-middle ${c.align === 'right' ? 'text-right' : ''} ${c.className || ''}`}>
                    {c.render ? c.render(row) : row[c.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="flex flex-col gap-3 md:hidden">
        {rows.map((row) => (
          <li key={row[rowKey]}>
            <div
              onClick={() => click(row)}
              className={`card flex flex-col gap-2 p-4 ${onRowClick ? 'cursor-pointer active:bg-primary-soft/40' : ''}`}
            >
              {columns.map((c) => (
                <div key={c.key} className="flex items-center justify-between gap-4 text-sm">
                  <span className="text-xs font-bold uppercase tracking-wide text-muted">{c.header}</span>
                  <span className="text-right">{c.render ? c.render(row) : row[c.key]}</span>
                </div>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
