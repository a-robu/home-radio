export default function AddBlockButton({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <button
      className={
        "flex cursor-pointer rounded-sm p-2 justify-center gap-1.5 bg-white/20 " +
        "text-white hover:bg-white/30"
      }
    >
      {children}
    </button>
  );
}
