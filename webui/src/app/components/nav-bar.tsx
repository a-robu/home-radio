"use client";

import { usePathname } from "next/navigation";
import { Music, List, Clock, Settings } from "lucide-react";

export function NavBar() {
  const pathname = usePathname();

  const tabs = [
    { label: "Player", icon: Music, path: "/" },
    { label: "Playlist", icon: List, path: "/playlist" },
    { label: "Timer", icon: Clock, path: "/timer" },
    { label: "Configure", icon: Settings, path: "/configure" },
  ];

  return (
    <div
      className="border-t border-white/30 px-4 py-2 flex justify-between"
      style={{ background: "rgb(4, 22, 32)" }}
    >
      {tabs.map(({ label, icon: Icon, path }) => (
        <a
          key={path}
          href={path}
          className={`flex flex-col items-center py-2 px-3 rounded-lg ${
            pathname === path
              ? "text-white bg-black/50"
              : "text-white/80 hover:text-white hover:bg-white/20"
          }`}
        >
          <Icon size={20} />
          <span className="text-xs mt-1 font-medium">{label}</span>
        </a>
      ))}
    </div>
  );
}
