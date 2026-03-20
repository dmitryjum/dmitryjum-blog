import Link from "next/link";

type Props = {
  href: string;
  label: string;
  active?: boolean;
};

export function TagLink({ href, label, active = false }: Props) {
  return (
    <Link
      href={href}
      className={[
        "inline-flex min-h-11 items-center rounded-full border px-4 py-2 text-sm font-medium leading-none transition-[border-color,background-color,color,transform] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950",
        active
          ? "border-cyan-300/70 bg-cyan-300/12 text-cyan-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_10px_24px_rgba(8,145,178,0.12)]"
          : "border-white/12 bg-white/[0.03] text-slate-300 hover:-translate-y-px hover:border-white/25 hover:bg-white/[0.06] hover:text-white",
      ].join(" ")}
    >
      {label}
    </Link>
  );
}
