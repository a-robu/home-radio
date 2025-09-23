import { NavBar } from "../components/nav-bar";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // The only target device is the Pixel 8a with w = 412px and h = 915px
    <div
      className="flex flex-col"
      style={{
        maxWidth: "412px",
        height: "100vh",
        maxHeight: "915px",
      }}
    >
      <div
        className="flex-1 overflow-y-auto bg-cover bg-center bg-relaxing-purple"
        // style={{
        //   backgroundImage: "url('/background-sky-white-birds.jpg')",
        // }}
      >
        {children}
      </div>
      <NavBar />
    </div>
  );
}
