import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import Home from '@/pages/Home';
import NovelGallery from '@/pages/NovelGallery';
import NovelCreate from '@/pages/NovelCreate';
import NovelDetail from '@/pages/NovelDetail';
import ScriptEditor from '@/pages/ScriptEditor';
import ScriptConvert from '@/pages/ScriptConvert';
import GameLobby from '@/pages/GameLobby';
import GameRoom from '@/pages/GameRoom';
import Profile from '@/pages/Profile';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Leaderboard from '@/pages/Leaderboard';

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'novels', element: <NovelGallery /> },
      { path: 'novels/create', element: <NovelCreate /> },
      { path: 'novels/:id', element: <NovelDetail /> },
      { path: 'scripts/convert/:novelId', element: <ScriptConvert /> },
      { path: 'scripts/:id', element: <ScriptEditor /> },
      { path: 'game', element: <Navigate to="/game/lobby" replace /> },
      { path: 'game/lobby', element: <GameLobby /> },
      { path: 'game/room/:code', element: <GameRoom /> },
      { path: 'leaderboard', element: <Leaderboard /> },
      { path: 'profile', element: <Profile /> },
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },
    ],
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
