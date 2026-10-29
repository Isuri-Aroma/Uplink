import EmptyState from './EmptyState';

// Table on desktop, cards on phones
export default function DataTable({ columns, rows, loading, empty, onRowClick, rowKey = '_id' }) {
  if (loading) {
    return (
      <div className="card skeleton-rows" aria-busy="true">
        {[1, 2, 3, 4].map((i) => (
          <div key={i}>
            <span style={{ width: '25%' }} />
            <span style={{ width: '33%' }} />
          </div>
        ))}
      </div>
    );
  }
  if (!rows.length) return <EmptyState {...empty} />;

  const click = (row) => onRowClick && onRowClick(row);
  const cell = (c, row) => (c.render ? c.render(row) : row[c.key]);

  return (
    <>
      <div className={`card data-table ${onRowClick ? 'data-table--clickable' : ''}`}>
        <table>
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={c.key} className={c.align === 'right' ? 'align-right' : undefined}>{c.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row[rowKey]} onClick={() => click(row)}>
                {columns.map((c) => (
                  <td key={c.key} className={c.align === 'right' ? 'align-right' : undefined}>{cell(c, row)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="data-cards">
        {rows.map((row) => (
          <li key={row[rowKey]}>
            <div onClick={() => click(row)} className="card data-card">
              {columns.map((c) => (
                <div key={c.key} className="data-card__row">
                  <span className="data-card__label">{c.header}</span>
                  <span className="data-card__value">{cell(c, row)}</span>
                </div>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
