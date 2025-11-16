export function Flag({
  countryCode,
  className = 'rounded-[2px]',
  url,
}: {
  countryCode?: string;
  className?: string;
  url?: string;
}) {
  if (!countryCode && !url) return null;
  return (
    <img
      src={url ?? `https://flagcdn.com/${countryCode?.toLowerCase()}.svg`}
      alt={countryCode}
      width={20}
      height={16}
      loading="lazy"
      className={className}
    />
  );
}
