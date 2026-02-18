interface TableShellProps {
  columns: string[];
  children?: React.ReactNode;
}

export function TableShell({ columns, children }: TableShellProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-body">
        <thead>
          <tr className="border-b border-neutral-border">
            {columns.map((col) => (
              <th
                key={col}
                className="text-left py-3 px-4 font-heading font-medium text-neutral-text text-caption uppercase tracking-wide text-neutral-text-secondary"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}
