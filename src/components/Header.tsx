import React, { useState } from 'react';
import {
  Sun,
  Moon,
  Download,
  Menu,
  X,
  Wallet,
  Zap,
  Layers,
  BookOpen,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  ChevronRight,
  FileCode,
  Globe,
  Radio,
} from 'lucide-react';
import { Logo } from './Logo';
import { Web3WalletState } from '../utils/web3';

interface HeaderProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  hasConvertedItems: boolean;
  onDownloadAll?: () => void;
  wallet?: Web3WalletState;
  onConnectWallet?: () => void;
  onScrollToConverter?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  darkMode,
  onToggleDarkMode,
  hasConvertedItems,
  onDownloadAll,
  wallet,
  onConnectWallet,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (id: string) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-[#090c13]/95 backdrop-blur-md border-b border-neutral-200/90 dark:border-neutral-800/90 transition-colors">
      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3 shrink-0">
          <a href="/" className="hover:opacity-90 transition-opacity">
            <Logo size="md" />
          </a>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-neutral-600 dark:text-neutral-400">
          <a
            href="#converter"
            className="hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            Converter
          </a>
          <a
            href="#how-it-works"
            className="hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            How it Works
          </a>
          <a
            href="#wordpress-plugin"
            className="hover:text-neutral-900 dark:hover:text-white transition-colors flex items-center gap-1.5"
          >
            <span>WP Plugin</span>
            <span className="text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.2 rounded border border-emerald-500/20">
              FREE
            </span>
          </a>
          <a
            href="#compare"
            className="hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            Compare
          </a>
          <a
            href="#seo-faq"
            className="hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            SEO & FAQ
          </a>
          <a
            href="#web3-integration"
            className="hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            Web3
          </a>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {wallet?.isConnected ? (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>
                {wallet.address?.substring(0, 6)}...{wallet.address?.substring(wallet.address.length - 4)}
              </span>
            </div>
          ) : (
            onConnectWallet && (
              <button
                type="button"
                onClick={onConnectWallet}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white bg-neutral-100 dark:bg-neutral-800/80 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-xl transition-all duration-150 cursor-pointer border border-neutral-200 dark:border-neutral-700 shadow-xs active:scale-95"
              >
                <Wallet className="w-3.5 h-3.5" />
                <span>Web3</span>
              </button>
            )
          )}

          {hasConvertedItems && onDownloadAll && (
            <button
              type="button"
              onClick={onDownloadAll}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 rounded-xl transition-all duration-150 shadow-xs whitespace-nowrap cursor-pointer active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download ZIP</span>
            </button>
          )}

          <a
            href="https://github.com/aialamin/optiwebp"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View on GitHub by Al Amin Hossain"
            title="GitHub: aialamin/optiwebp"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white bg-neutral-100 dark:bg-neutral-800/80 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-xl transition-all duration-150 border border-neutral-200 dark:border-neutral-700 shadow-xs active:scale-95"
          >
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            <span className="font-mono">GitHub</span>
          </a>

          <button
            type="button"
            onClick={onToggleDarkMode}
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            className="p-2 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-all duration-150 cursor-pointer active:scale-95"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Mobile Hamburger Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle mobile navigation menu"
            className="p-2 md:hidden text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-colors cursor-pointer active:scale-95"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-neutral-900 dark:text-white" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* ULTRA-COOL GLASSMORPHIC MOBILE MENU DRAWER */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-neutral-200 dark:border-neutral-800/80 bg-white/95 dark:bg-[#07090e]/95 backdrop-blur-2xl shadow-2xl transition-all animate-in slide-in-from-top-3 duration-200">
          {/* Subtle Top Accent Glow Line */}
          <div className="h-0.5 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400" />

          <div className="px-4 py-4 space-y-3.5 max-h-[85vh] overflow-y-auto">
            {/* Live Status Pill */}
            <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-850 border border-neutral-200/70 dark:border-neutral-800 text-[11px] font-mono">
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>WebP Engine Ready</span>
              </div>
              <span className="text-neutral-500 dark:text-neutral-400">100% In-Browser</span>
            </div>

            {/* Primary Action Hero Card: Convert Now */}
            <button
              type="button"
              onClick={() => handleNavClick('converter')}
              className="group w-full flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/20 active:scale-[0.98] transition-all cursor-pointer text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-sm font-bold">Start WebP Converter</div>
                  <div className="text-[11px] text-emerald-100/90 font-mono">Parallel Multi-Core · Drag & Drop</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Navigation Grid Cards with Clean Lucide Icons */}
            <div className="grid grid-cols-1 gap-2 pt-0.5">
              <button
                type="button"
                onClick={() => handleNavClick('how-it-works')}
                className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-[#121620] border border-neutral-200/80 dark:border-neutral-800 hover:border-emerald-500/40 text-left active:scale-[0.99] transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-neutral-900 dark:text-white">How WebP Works</div>
                    <div className="text-[10px] text-neutral-500 dark:text-neutral-400">Interactive live simulation</div>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/20">
                  Demo
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleNavClick('wordpress-plugin')}
                className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-[#121620] border border-neutral-200/80 dark:border-neutral-800 hover:border-emerald-500/40 text-left active:scale-[0.99] transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-neutral-900 dark:text-white">WordPress Plugin</div>
                    <div className="text-[10px] text-neutral-500 dark:text-neutral-400">Automate uploads & .htaccess</div>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold text-white bg-emerald-600 px-2 py-0.5 rounded shadow-xs">
                  FREE ZIP
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleNavClick('compare')}
                className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-[#121620] border border-neutral-200/80 dark:border-neutral-800 hover:border-emerald-500/40 text-left active:scale-[0.99] transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-neutral-200/70 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-neutral-900 dark:text-white">Market Comparison</div>
                    <div className="text-[10px] text-neutral-500 dark:text-neutral-400">vs Squoosh & TinyPNG</div>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400">
                  $0 Free
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleNavClick('seo-faq')}
                className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-[#121620] border border-neutral-200/80 dark:border-neutral-800 hover:border-emerald-500/40 text-left active:scale-[0.99] transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-neutral-200/70 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 flex items-center justify-center shrink-0">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-neutral-900 dark:text-white">Image SEO & Vitals</div>
                    <div className="text-[10px] text-neutral-500 dark:text-neutral-400">Core Web Vitals Guide</div>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400">
                  FAQ
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleNavClick('web3-integration')}
                className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-[#121620] border border-neutral-200/80 dark:border-neutral-800 hover:border-emerald-500/40 text-left active:scale-[0.99] transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-neutral-200/70 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 flex items-center justify-center shrink-0">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-neutral-900 dark:text-white">Web3 & IPFS Storage</div>
                    <div className="text-[10px] text-neutral-500 dark:text-neutral-400">Decentralized asset pinning</div>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400">
                  Web3
                </span>
              </button>
            </div>

            {/* Mobile Bottom Utilities Row: Theme Toggle, Web3, GitHub */}
            <div className="pt-3 border-t border-neutral-200/80 dark:border-neutral-800/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onToggleDarkMode}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 text-xs font-medium cursor-pointer"
                >
                  {darkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5" />}
                  <span>{darkMode ? 'Light' : 'Dark'}</span>
                </button>

                {onConnectWallet && (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onConnectWallet();
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 text-xs font-medium cursor-pointer"
                  >
                    <Wallet className="w-3.5 h-3.5" />
                    <span>{wallet?.isConnected ? 'Connected' : 'Web3'}</span>
                  </button>
                )}
              </div>

              <a
                href="https://github.com/aialamin/optiwebp"
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-[11px] text-neutral-500 dark:text-neutral-400 hover:text-emerald-500 flex items-center gap-1"
              >
                <span>@aialamin</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
