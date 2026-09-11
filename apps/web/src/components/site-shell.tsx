"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
const links = [
  ["Work", "/work"],
  ["Services", "/services"],
  ["About", "/about"],
  ["Insights", "/insights"],
];
export function Header() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    setOpen(false);
  }, [path]);
  return (
    <header
      className="header"
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          setOpen(false);
          toggle.current?.focus();
        }
      }}
    >
      <div className="container header-inner">
        <Link href="/" aria-label="GhimTech home" className="wordmark">
          <span className="brand-mark" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          GhimTech<span className="wordmark-dot">.</span>
        </Link>
        <button
          ref={toggle}
          className="menu-toggle"
          aria-expanded={open}
          aria-controls="site-navigation"
          onClick={() => setOpen(!open)}
        >
          {open ? "Close −" : "Menu +"}
        </button>
        <nav
          id="site-navigation"
          aria-label="Main navigation"
          className={open ? "navigation is-open" : "navigation"}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setOpen(false);
              toggle.current?.focus();
            }
          }}
        >
          {links.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              aria-current={path === href || path.startsWith(href + "/") ? "page" : undefined}
            >
              {label}
            </Link>
          ))}
          <Link href="/contact" className="button button-small">
            Start a Project <span aria-hidden="true">↗</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
