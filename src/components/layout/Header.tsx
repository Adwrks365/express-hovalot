"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { mainNavigation, type NavItem } from "@/config/navigation";
import { HeaderDropdown } from "@/components/layout/HeaderDropdown";
import { HeaderShell } from "@/components/layout/HeaderShell";
import { Logo } from "@/components/layout/Logo";
import { MobileHeaderPhone, PhoneCta } from "@/components/layout/PhoneCta";
import { WhatsAppCta } from "@/components/layout/WhatsAppCta";
import { Button } from "@/components/ui/Button";

function ChevronDown({ open }: { open?: boolean }) {
  return (
    <svg
      className={`h-3.5 w-3.5 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
        clipRule="evenodd"
      />
    </svg>
  );
}

const navLinkClass =
  "px-1 py-2 text-[13px] font-medium text-white hover:bg-white/10 focus-visible:bg-white/10 min-[1366px]:text-[14px] min-[1440px]:px-1.5 min-[1600px]:px-2 min-[1600px]:text-[15px] min-[1800px]:px-2.5 min-[1800px]:text-[16px]";

function closeAllMenus(setters: {
  setOpen: (v: boolean) => void;
  setMobileExpanded: (v: string | null) => void;
  setDesktopOpen: (v: string | null) => void;
}) {
  setters.setOpen(false);
  setters.setMobileExpanded(null);
  setters.setDesktopOpen(null);
}

function rectsIntersect(a: DOMRect, b: DOMRect, minGap = 8): boolean {
  return !(
    a.right + minGap <= b.left ||
    a.left >= b.right + minGap ||
    a.bottom + minGap <= b.top ||
    a.top >= b.bottom + minGap
  );
}

export function Header() {
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const desktopRowRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const [desktopOpen, setDesktopOpen] = useState<string | null>(null);
  const [desktopNavCollapsed, setDesktopNavCollapsed] = useState(false);
  const [prevPathname, setPrevPathname] = useState(pathname);

  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setOpen(false);
    setMobileExpanded(null);
    setDesktopOpen(null);
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        closeAllMenus({ setOpen, setMobileExpanded, setDesktopOpen });
        menuButtonRef.current?.focus();
      }
    }
    function onPointerDown(e: PointerEvent) {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setDesktopOpen(null);
      }
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, []);

  useLayoutEffect(() => {
    const nav = navRef.current;
    const actions = actionsRef.current;
    if (!nav || !actions) return;

    function measureNavActionCollision() {
      const navLinks = [...nav!.querySelectorAll("a")].filter(
        (el) => el.closest('[role="menu"]') === null,
      );
      const actionLinks = [...actions!.querySelectorAll("a, button")];
      if (!navLinks.length || !actionLinks.length) return false;
      if (nav!.scrollWidth > nav!.clientWidth + 1) return true;

      const lastNav = navLinks[navLinks.length - 1]!.getBoundingClientRect();
      const firstAction = actionLinks[0]!.getBoundingClientRect();
      if (lastNav.width <= 0 || firstAction.width <= 0) return false;

      return rectsIntersect(lastNav, firstAction, 4);
    }

    function auditDesktopFit() {
      const width = window.innerWidth;
      if (width < 1280) {
        setDesktopNavCollapsed(false);
        return;
      }

      setDesktopNavCollapsed(false);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setDesktopNavCollapsed(measureNavActionCollision());
        });
      });
    }

    auditDesktopFit();
    window.addEventListener("resize", auditDesktopFit);
    return () => window.removeEventListener("resize", auditDesktopFit);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        closeAllMenus({ setOpen, setMobileExpanded, setDesktopOpen });
        menuButtonRef.current?.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    document.documentElement.setAttribute("data-menu-open", "");
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      document.documentElement.removeAttribute("data-menu-open");
    };
  }, [open]);

  const onNavigate = () => closeAllMenus({ setOpen, setMobileExpanded, setDesktopOpen });

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-50 overflow-visible border-b border-white/10 bg-header-gradient shadow-sm"
      style={{ ["--header-offset" as string]: "6rem" }}
    >
      <HeaderShell className="py-1 xl:py-1.5">
        {/* Mobile / tablet — below 1280px */}
        <div
          className={`grid min-h-[72px] grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 max-[360px]:gap-1.5 sm:gap-3 ${desktopNavCollapsed ? "" : "xl:hidden"}`}
        >
          <div className="shrink-0 justify-self-start">
            <Logo className="[&_img]:h-12 [&_img]:max-h-[52px] [&_img]:w-auto [&_img]:max-w-[132px] max-[360px]:[&_img]:max-w-[118px]" />
          </div>
          <div className="flex min-w-0 justify-center px-1">
            <MobileHeaderPhone />
          </div>
          <div className="shrink-0 justify-self-end">
            <button
              ref={menuButtonRef}
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 text-white hover:bg-white/10 focus-visible:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={open ? "סגור תפריט" : "פתיחת תפריט"}
              onClick={() => setOpen((v) => !v)}
            >
              <svg className="h-[22px] w-[22px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                {open ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Desktop — 1280px+ single row: [logo] [nav flex-1] [actions] */}
        <div
          ref={desktopRowRef}
          className={`min-h-[68px] grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 min-[1440px]:gap-3 min-[1600px]:gap-4 min-[1800px]:gap-6 ${
            desktopNavCollapsed ? "hidden" : "hidden xl:grid"
          }`}
        >
          <div className="shrink-0 justify-self-start">
            <Logo className="[&_img]:max-h-[56px] [&_img]:h-auto [&_img]:w-auto sm:[&_img]:h-12 lg:[&_img]:h-14 min-[1800px]:[&_img]:max-h-[58px] min-[1800px]:[&_img]:h-[3.625rem]" />
          </div>

          <nav
            ref={navRef}
            className="flex min-w-0 flex-1 items-center justify-center gap-0 overflow-visible px-0.5"
            aria-label="ניווט ראשי"
          >
            {mainNavigation.map((item) =>
              item.children ? (
                <div key={item.href} className="group relative">
                  <Link
                    href={item.href}
                    className={`inline-flex items-center gap-0.5 whitespace-nowrap rounded-md ${navLinkClass}`}
                    aria-expanded={desktopOpen === item.href}
                    aria-haspopup="menu"
                    onClick={() => setDesktopOpen((cur) => (cur === item.href ? null : item.href))}
                  >
                    {item.label}
                    <ChevronDown open={desktopOpen === item.href} />
                  </Link>
                  <div className="absolute inset-x-0 top-full hidden h-2 xl:block" aria-hidden="true" />
                  <HeaderDropdown
                    item={item as NavItem & { children: NavItem[] }}
                    open={desktopOpen === item.href}
                    onNavigate={onNavigate}
                  />
                </div>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`whitespace-nowrap rounded-md ${navLinkClass}`}
                  onClick={onNavigate}
                >
                  {item.label}
                </Link>
              ),
            )}
          </nav>

          <div
            ref={actionsRef}
            className="flex shrink-0 items-center justify-end gap-2 ps-2 min-[1600px]:gap-2.5 min-[1600px]:ps-4"
          >
            <PhoneCta
              variant="pill"
              className="text-[14px] min-[1800px]:text-[15px]"
            />
            <span className="hidden min-[1800px]:contents">
              <WhatsAppCta
                variant="link"
                label=""
                className="h-[42px] min-h-0 w-[42px] justify-center rounded-full px-0 text-white/85 hover:bg-white/10"
              />
            </span>
            <Button
              href="/הצעת-מחיר"
              variant="gold"
              className="min-h-[42px] whitespace-nowrap px-3 py-2 text-[13px] font-bold min-[1366px]:px-4 min-[1366px]:text-[14px] min-[1600px]:px-5 min-[1800px]:text-[15px]"
            >
              הצעת מחיר
            </Button>
          </div>
        </div>
      </HeaderShell>

      {open ? (
        <nav
          id="mobile-nav"
          className={`border-t border-white/10 bg-brand-800 ${desktopNavCollapsed ? "" : "xl:hidden"}`}
          aria-label="ניווט נייד"
          role="dialog"
          aria-modal="true"
        >
          <HeaderShell className="flex max-h-[70vh] flex-col gap-1 overflow-y-auto py-4">
            {mainNavigation.map((item) => {
              const expanded = mobileExpanded === item.href;
              return (
                <div key={item.href}>
                  <div className="flex items-center gap-1">
                    <Link
                      href={item.href}
                      className="min-h-[44px] flex-1 rounded-md px-3 py-3 text-base font-medium text-white hover:bg-white/10 focus-visible:bg-white/10"
                      onClick={onNavigate}
                    >
                      {item.label}
                    </Link>
                    {item.children ? (
                      <button
                        type="button"
                        className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-white hover:bg-white/10 focus-visible:bg-white/10"
                        aria-expanded={expanded}
                        aria-controls={`mobile-sub-${item.href}`}
                        aria-label={
                          expanded ? `סגור תת-תפריט ${item.label}` : `פתח תת-תפריט ${item.label}`
                        }
                        onClick={() => setMobileExpanded(expanded ? null : item.href)}
                      >
                        <ChevronDown open={expanded} />
                      </button>
                    ) : null}
                  </div>
                  {item.children && expanded ? (
                    <div id={`mobile-sub-${item.href}`} className="me-3 border-e-2 border-accent/40 pe-2">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="block min-h-[44px] rounded-md px-3 py-2.5 text-sm leading-snug text-white/85 hover:bg-white/10 focus-visible:bg-white/10"
                          style={{ whiteSpace: "normal", overflowWrap: "anywhere" }}
                          onClick={onNavigate}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            })}
            <div className="mt-4 flex flex-col gap-3 border-t border-white/10 pt-4">
              <WhatsAppCta className="w-full justify-center" label="שלחו WhatsApp" />
              <Button href="/הצעת-מחיר" variant="gold" className="w-full" onClick={onNavigate}>
                הצעת מחיר
              </Button>
            </div>
          </HeaderShell>
        </nav>
      ) : null}
    </header>
  );
}
