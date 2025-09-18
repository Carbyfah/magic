interface IconProps {
  className?: string;
}

export default function ArrowUpIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="m18 15-6-6-6 6"/>
    </svg>
  );
}
