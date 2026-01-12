export default function DesignSystemLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container max-w-6xl py-8 px-6">
      {children}
    </div>
  );
}
