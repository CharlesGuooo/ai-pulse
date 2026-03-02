/*
 * Design: Editorial Warmth
 * Navbar: Clean top navigation with logo, nav links, and status indicator
 * Colors: Cream background with orange accents
 */
import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { Menu, X, Bookmark, Zap } from 'lucide-react';

const LOGO_URL = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663393655905/WLAVeVPYGCycWsT7vD3Ng4/logo-icon-TwHKjaXnnFpF9t2eASLKRp.webp';

const navLinks = [
  { href: '/', label: '首页', icon: Zap },
  { href: '/voices', label: '大V动态' },
  { href: '/academic', label: '学术前沿' },
  { href: '/archive', label: '收藏夹', icon: Bookmark },
];

export default function Navbar() {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/90 backdrop-blur-md">
      <div className="container flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <img
            src={LOGO_URL}
            alt="AI Pulse"
            className="w-8 h-8 transition-transform group-hover:scale-110"
          />
          <div className="flex flex-col">
            <span className="text-lg font-semibold tracking-tight leading-none" style={{ fontFamily: 'var(--font-display)' }}>
              AI Pulse
            </span>
            <span className="text-[10px] text-muted-foreground tracking-widest uppercase leading-none mt-0.5" style={{ fontFamily: 'var(--font-mono)' }}>
              AI前沿资讯
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(link => {
            const isActive = location === link.href || (link.href !== '/' && location.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'relative px-3.5 py-2 text-sm font-medium rounded-md transition-colors',
                  isActive
                    ? 'text-brand-orange'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                )}
              >
                <span className="flex items-center gap-1.5">
                  {link.icon && <link.icon className="w-3.5 h-3.5" />}
                  {link.label}
                </span>
                {isActive && (
                  <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-brand-orange rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Status indicator */}
        <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-mono)' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          每12h自动更新
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 rounded-md hover:bg-secondary/60 transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <nav className="md:hidden border-t border-border/60 bg-background/95 backdrop-blur-md">
          <div className="container py-3 flex flex-col gap-1">
            {navLinks.map(link => {
              const isActive = location === link.href || (link.href !== '/' && location.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'px-3 py-2.5 text-sm font-medium rounded-md transition-colors flex items-center gap-2',
                    isActive
                      ? 'text-brand-orange bg-accent'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                  )}
                  onClick={() => setMobileOpen(false)}
                >
                  {link.icon && <link.icon className="w-4 h-4" />}
                  {link.label}
                </Link>
              );
            })}
            <div className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-mono)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              每12h自动更新
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
