
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Toaster } from './components/ui/toaster';
import { AuthProvider } from '@/hooks/use-auth';

// Pages
import Index from './pages/Index';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';
import Search from './pages/Search';
import ParkingSpotDetails from './pages/ParkingSpotDetails';
import ForHosts from './pages/ForHosts';
import Admin from './pages/Admin';
import BecomeHost from './pages/BecomeHost';
import HostProfileSetup from './pages/HostProfileSetup';
import ManageParkingSpaces from './pages/ManageParkingSpaces';

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 10000,
    },
  },
});

// Create router
const router = createBrowserRouter([
  {
    path: '/',
    element: <Index />,
  },
  {
    path: '/auth',
    element: <Auth />,
  },
  {
    path: '/dashboard',
    element: <Dashboard />,
  },
  {
    path: '/search',
    element: <Search />,
  },
  {
    path: '/parking-spot/:id',
    element: <ParkingSpotDetails />,
  },
  {
    path: '/for-hosts',
    element: <ForHosts />,
  },
  {
    path: '/become-host',
    element: <BecomeHost />,
  },
  {
    path: '/host-profile-setup',
    element: <HostProfileSetup />,
  },
  {
    path: '/manage-parking-spaces',
    element: <ManageParkingSpaces />,
  },
  {
    path: '/admin',
    element: <Admin />,
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="parkongo-theme">
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
          <Toaster />
        </QueryClientProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
