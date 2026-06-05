import { Outlet } from 'react-router-dom';
import TopNavbar from './TopNavbar';

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-bg-primary">
      <TopNavbar />
      <main className="pt-16">
        <Outlet />
      </main>
    </div>
  );
}
