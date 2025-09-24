"use client";

import { Music } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NotFound() {
  const currentPath = usePathname();

  return (
    <div
      className="h-screen flex items-center justify-center text-white"
      style={{
        backgroundColor: "#82474f",
      }}
    >
      <div>
        <h1 className="text-4xl mb-4">
          <span className="font-bold">404</span> Not found
        </h1>
        <p>
          Resource{" "}
          <span className="inline-block bg-black/50 px-1 py-0.5 rounded font-mono">
            {currentPath}
          </span>{" "}
          does not exist.
        </p>
        <Link
          className="mt-4 block bg-white/20 p-5 rounded text-center"
          href="/"
        >
          <Music className="inline" /> Return Home
        </Link>
      </div>
    </div>
  );
}
