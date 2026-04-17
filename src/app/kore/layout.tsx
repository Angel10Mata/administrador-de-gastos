import Sidebar from "@/components/Sidebar";

export default function KoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex w-full min-h-screen relative bg-background">
      <Sidebar />
      <div className="flex-1 w-full min-w-0 pl-16 md:pl-[88px]">
        {children}
      </div>
    </div>
  );
}
