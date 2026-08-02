type BadgeProps = {
  label: string;
};

export default function Badge({ label }: BadgeProps) {
  return (
    <span className="rounded-full border border-foreground/10 bg-white/60 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-muted">
      {label}
    </span>
  );
}
