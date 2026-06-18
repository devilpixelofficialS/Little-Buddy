"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

interface SidebarProps {
  open: boolean;
  onToggle: () => void;
}

const NAV_ITEMS = [
  {
    label: "Assistant",
    href: "/",
    icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
  },
  {
    label: "Memory",
    href: "/memory",
    icon: "M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7C5 4 4 5 4 7z",
  },
  {
    label: "Skills",
    href: "/skills",
    icon: "M13 10V3L4 14h7v7l9-11h-7z",
  },
  {
    label: "Workflows",
    href: "/workflows",
    icon: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15",
  },
  {
    label: "Settings",
    href: "/settings",
    icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z",
  },
];

export function Sidebar({ open, onToggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={`
        flex flex-col bg-background-secondary border-r border-background-tertiary
        transition-all duration-200 ease-in-out
        ${open ? "w-64" : "w-16"}
      `}
    >
      <div className="flex items-center justify-between h-16 px-4 border-b border-background-tertiary">
        {open && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-accent-primary/20 flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-accent-primary" />
            </div>
            <span className="font-semibold text-text-primary">Little Buddy</span>
          </div>
        )}
        <button
          onClick={onToggle}
          className="p-2 text-text-secondary hover:text-text-primary hover:bg-background-tertiary rounded-lg transition-colors duration-150"
          aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            {open ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            )}
          </svg>
        </button>
      </div>

      <nav className="flex-1 py-4 px-2 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-150
                ${isActive
                  ? "bg-accent-primary/10 text-accent-primary"
                  : "text-text-secondary hover:text-text-primary hover:bg-background-tertiary"
                }
              `}
            >
              <svg
                className="w-5 h-5 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
              </svg>
              {open && <span className="text-sm font-medium">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-background-tertiary">
        {open ? (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-background-tertiary flex items-center justify-center">
              <span className="text-sm text-text-muted">U</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-text-primary">User</span>
              <span className="text-xs text-text-muted">Local</span>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-8 h-8 rounded-full bg-background-tertiary flex items-center justify-center">
              <span className="text-sm text-text-muted">U</span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
