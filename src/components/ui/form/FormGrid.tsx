interface FormGridProps {
  cols?: 1 | 2 | 3;
  children: React.ReactNode;
}

const gridCols = {
  1: "grid-cols-1",
  2: "grid-cols-2 gap-4",
  3: "grid-cols-3 gap-4",
};

export function FormGrid({
  cols = 2,
  children,
}: FormGridProps) {
  return (
    <div className={`grid ${gridCols[cols]}`}>
      {children}
    </div>
  );
}
