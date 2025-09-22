"use client";

import { usePathname, useRouter } from "next/navigation";
import { Music, List, Clock, Settings } from "lucide-react";

export function NavBar() {
  const pathname = usePathname();
  const router = useRouter();

  const tabs = [
    { id: "player", label: "Player", icon: Music, path: "/" },
    { id: "playlist", label: "Playlist", icon: List, path: "/playlist" },
    { id: "timer", label: "Timer", icon: Clock, path: "/timer" },
    { id: "configure", label: "Configure", icon: Settings, path: "/configure" },
  ];

  const handleTabClick = (path: string) => {
    router.push(path);
  };

  return (
    <div
      className="border-t border-white/30 px-4 py-2"
      style={{ background: "rgb(4, 22, 32)", borderColor: "rgb(80, 92, 100)" }}
    >
      <div className="flex justify-around items-center">
        {tabs.map(({ id, label, icon: Icon, path }) => (
          <button
            key={id}
            onClick={() => handleTabClick(path)}
            className={`flex flex-col items-center py-2 px-3 p-6 rounded-lg transition-colors ${
              pathname === path
                ? "text-white bg-black/50"
                : "text-white/80 hover:text-white hover:bg-white/20"
            }`}
          >
            <Icon size={20} />
            <span className="text-xs mt-1 font-medium">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
