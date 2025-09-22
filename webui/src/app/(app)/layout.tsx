import { NavBar } from "../components/nav-bar";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="max-w-md mx-auto h-screen flex flex-col">
      <div className="flex-1 overflow-y-auto">{children}</div>
      <NavBar />
    </div>
  );
}
