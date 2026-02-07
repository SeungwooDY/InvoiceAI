import { Outlet } from 'react-router-dom';
import { AppSidebar } from './AppSidebar';

export function AppLayout() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Floating orbs for ambient effect */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      
      <AppSidebar />
      <main className="pl-64 relative z-10">
        <Outlet />
      </main>
    </div>
  );
}
