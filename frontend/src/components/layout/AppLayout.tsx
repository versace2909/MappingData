import TopNavBar from "./TopNavBar";
import SideNavBar from "./SideNavBar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f7f9fb]">
      <TopNavBar />
      <div className="flex">
        <SideNavBar />
        <main className="ml-64 mt-16 flex-1 min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </div>
    </div>
  );
}
