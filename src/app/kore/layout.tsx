import Sidebar from "@/components/Sidebar";

export default function KoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col w-full min-h-screen relative bg-background">
      <div className="flex-1 w-full min-w-0">
        {children}
      </div>
    </div>
  );
}
