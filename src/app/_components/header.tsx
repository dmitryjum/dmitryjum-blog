'use client';
import { useLayoutContext } from "@/app/context/LayoutContext";

export function Header() {
  const { headerTitle, headerSubtitle, logo } = useLayoutContext();

  return (
    <header id="header" className="alt">
      <span className="logo"><img src={logo} alt="" /></span>
      <h1>{headerTitle}</h1>
      <p>{headerSubtitle}</p>
    </header>
  );
}
