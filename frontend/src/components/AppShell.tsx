import { NavLink } from 'react-router-dom'
import {
  Boxes,
  ClipboardCheck,
  Home,
  MessageSquareText,
  Plug,
  Share2,
  SquareStack,
  type LucideIcon,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { ShaderBackground } from '@/components/ShaderBackground'

interface NavItem {
  to: string
  label: string
  short: string
  icon: LucideIcon
}

const PRIMARY: NavItem[] = [
  { to: '/', label: 'Home', short: 'Home', icon: Home },
  { to: '/graph', label: 'Knowledge graph', short: 'Graph', icon: Share2 },
  { to: '/ask', label: 'Ask Copilot', short: 'Ask', icon: MessageSquareText },
  { to: '/workflows', label: 'Workflows', short: 'Work', icon: SquareStack },
]

const SECONDARY: NavItem[] = [
  { to: '/connectors', label: 'Connectors', short: 'Sources', icon: Plug },
  { to: '/assets', label: 'Assets', short: 'Assets', icon: Boxes },
  { to: '/review', label: 'Review queue', short: 'Review', icon: ClipboardCheck },
]

function Brand() {
  // The source PNG (1536x1024) has large transparent padding around the "Atlas"
  // script (~17% top, ~29% bottom, ~7% sides). We clip to just the wordmark so
  // it renders large and tight instead of small-inside-empty-space.
  return (
    <div
      className="overflow-hidden"
      style={{ width: 122, height: 52 }}
    >
      <img
        src="/atlas-logo.png"
        alt="Atlas"
        draggable={false}
        className="max-w-none select-none"
        style={{ width: 144, marginLeft: -10, marginTop: -16 }}
      />
    </div>
  )
}

function SideNavLink({ item }: { item: NavItem }) {
  const Icon = item.icon
  return (
    <NavLink
      to={item.to}
      end={item.to === '/'}
      className={({ isActive }) =>
        cn(
          'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
          isActive
            ? 'bg-card text-foreground shadow-soft'
            : 'text-muted-foreground hover:bg-card/60 hover:text-foreground',
        )
      }
    >
      {({ isActive }) => (
        <>
          <span
            className={cn(
              'absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-full bg-primary transition-opacity',
              isActive ? 'opacity-100' : 'opacity-0',
            )}
            aria-hidden
          />
          <Icon
            className={cn('size-4.5', isActive && 'text-primary')}
            aria-hidden
          />
          {item.label}
        </>
      )}
    </NavLink>
  )
}

function BottomTab({ item }: { item: NavItem }) {
  const Icon = item.icon
  return (
    <NavLink
      to={item.to}
      end={item.to === '/'}
      className={({ isActive }) =>
        cn(
          'flex flex-1 flex-col items-center justify-center gap-1 rounded-lg py-1.5 text-[11px] font-medium transition-colors',
          isActive ? 'text-primary' : 'text-muted-foreground',
        )
      }
    >
      <Icon className="size-5" aria-hidden />
      {item.short}
    </NavLink>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-svh">
      {/* Animated shader background — sits behind everything, ignores input */}
      <ShaderBackground />

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col gap-8 px-4 py-6 md:flex">
        <div className="px-2">
          <Brand />
        </div>
        <nav className="flex flex-col gap-1">
          {PRIMARY.map((item) => (
            <SideNavLink key={item.to} item={item} />
          ))}
        </nav>
        <div className="flex flex-col gap-1">
          <p className="px-3 pb-1 text-xs font-medium text-muted-foreground/70">
            Records
          </p>
          {SECONDARY.map((item) => (
            <SideNavLink key={item.to} item={item} />
          ))}
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex items-center border-b border-border/70 bg-background/85 px-4 py-3 backdrop-blur md:hidden">
        <Brand />
      </header>

      {/* Main content */}
      <main className="px-4 pb-24 pt-6 md:ml-64 md:px-8 md:pb-10 lg:px-12">
        <div className="mx-auto w-full max-w-6xl">{children}</div>
      </main>

      {/* Mobile bottom tab bar */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex items-stretch gap-1 border-t border-border/70 bg-background/90 px-2 py-1.5 backdrop-blur md:hidden">
        {PRIMARY.map((item) => (
          <BottomTab key={item.to} item={item} />
        ))}
      </nav>
    </div>
  )
}
