import React from 'react';
import { ShieldCheck, HardDrive, WifiOff, Cpu } from 'lucide-react';

export const PrivacyBanner: React.FC = () => {
  return (
    <div className="w-full my-6 p-4 rounded-2xl bg-neutral-100/70 dark:bg-[#11141b] border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-600 dark:text-neutral-400">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-neutral-900 dark:text-white font-semibold">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>100% Private & Local</span>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-[11px] text-neutral-500 dark:text-neutral-400">
          <span className="flex items-center gap-1">
            <Cpu className="w-3.5 h-3.5" /> Hardware Canvas Engine
          </span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <HardDrive className="w-3.5 h-3.5" /> Zero Server Uploads
          </span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <WifiOff className="w-3.5 h-3.5" /> Works Offline
          </span>
        </div>
      </div>
    </div>
  );
};
