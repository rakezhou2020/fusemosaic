export function BrandMark({ inverse = false }: { inverse?: boolean }) {
  return (
    <span className={`brand-mark${inverse ? " brand-mark--inverse" : ""}`} aria-hidden="true">
      {Array.from({ length: 16 }, (_, index) => <i key={index} />)}
    </span>
  );
}
