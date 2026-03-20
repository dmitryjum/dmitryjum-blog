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
        "inline-flex min-h-11 items-center rounded-full border px-4 py-2 text-sm font-medium leading-none transition-[border-color,background-color,color,transform,box-shadow] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950",
        active
          ? "border-fuchsia-300/60 bg-[rgb(101,49,134)] text-fuchsia-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_10px_24px_rgba(101,49,134,0.28)]"
          : "border-slate-700 bg-slate-900 text-slate-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] hover:-translate-y-px hover:border-slate-500 hover:bg-slate-800 hover:text-white",
      ].join(" ")}
    >
      {label}
    </Link>
  );
}
